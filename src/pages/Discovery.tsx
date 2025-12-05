import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  MapPin, 
  Building2,
  Play,
  Pause,
  RotateCw,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useLeads } from "@/hooks/useLeads";
import { toast } from "sonner";

const categories = [
  "Restaurants",
  "Plumbing",
  "Landscaping",
  "Auto Repair",
  "Dentists",
  "Law Firms",
  "Real Estate",
  "Salons & Spas",
  "Contractors",
  "Cleaning Services"
];

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

const Discovery = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [discoveryStats, setDiscoveryStats] = useState({
    found: 0,
    noWebsite: 0,
    withEmail: 0,
    duplicates: 0,
  });
  const [recentJobs, setRecentJobs] = useState<Array<{
    city: string;
    category: string;
    status: string;
    leads: number;
  }>>([]);

  const { createLead } = useLeads();

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const startDiscovery = async () => {
    if (!city || !state) {
      toast.error("Please enter a city and select a state");
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error("Please select at least one business category");
      return;
    }

    setIsRunning(true);
    setProgress(10);

    try {
      const location = `${city}, ${state}`;
      
      // Add to recent jobs
      setRecentJobs(prev => [{
        city: location,
        category: selectedCategories.join(", "),
        status: "running",
        leads: 0
      }, ...prev.slice(0, 3)]);

      setProgress(30);

      const { data, error } = await supabase.functions.invoke('discover-businesses', {
        body: {
          location,
          categories: selectedCategories,
          limit: 50,
        },
      });

      if (error) throw error;

      setProgress(70);

      const businesses = data.businesses || [];
      let savedCount = 0;
      let noWebsiteCount = 0;

      for (const business of businesses) {
        if (business.website_status === 'none') {
          noWebsiteCount++;
        }

        try {
          await createLead.mutateAsync({
            business_name: business.business_name,
            category: business.category,
            city: business.city,
            state: business.state,
            phone: business.phone,
            source: business.source,
            website_status: business.website_status,
            score: business.score,
          });
          savedCount++;
        } catch (e) {
          console.log("Duplicate or error saving lead:", business.business_name);
        }
      }

      setProgress(100);
      
      setDiscoveryStats({
        found: businesses.length,
        noWebsite: noWebsiteCount,
        withEmail: 0,
        duplicates: businesses.length - savedCount,
      });

      // Update recent job status
      setRecentJobs(prev => prev.map((job, i) => 
        i === 0 ? { ...job, status: "completed", leads: savedCount } : job
      ));

      toast.success(`Discovery complete! Found ${savedCount} new leads`);
    } catch (error: any) {
      console.error("Discovery error:", error);
      toast.error(error.message || "Discovery failed");
      
      setRecentJobs(prev => prev.map((job, i) => 
        i === 0 ? { ...job, status: "failed", leads: 0 } : job
      ));
    } finally {
      setIsRunning(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Discovery</h1>
            <p className="text-muted-foreground mt-1">
              Discover businesses without websites using Yelp
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isRunning && (
              <Button variant="outline" onClick={() => setIsRunning(false)}>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}
            <Button 
              variant="hero" 
              onClick={startDiscovery}
              disabled={isRunning}
            >
              <Play className="w-4 h-4 mr-2" />
              {isRunning ? "Running..." : "Start Discovery"}
            </Button>
          </div>
        </div>

        {/* Discovery Status */}
        {isRunning && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center animate-pulse">
                    <Search className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Discovery Running</p>
                    <p className="text-sm text-muted-foreground">
                      Scanning {city}, {state} - {selectedCategories.join(", ")}
                    </p>
                  </div>
                </div>
                <Badge variant="info">In Progress</Badge>
              </div>
              <Progress value={progress} className="h-2 mb-2" />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{progress}% complete</span>
                <span>Processing...</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Location Settings */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Location Settings
                </CardTitle>
                <CardDescription>
                  Define the geographic areas to search for businesses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input 
                      placeholder="e.g., Austin" 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Select value={state} onValueChange={setState}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Selection */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Business Categories
                </CardTitle>
                <CardDescription>
                  Select which types of businesses to discover
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 cursor-pointer transition-colors"
                    >
                      <Checkbox 
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Data Sources */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  Data Source
                </CardTitle>
                <CardDescription>
                  Business discovery powered by Yelp Fusion API
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-lg border border-primary/30 bg-primary/5">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span className="font-medium">Yelp Fusion API</span>
                  </div>
                  <Badge variant="success">Connected</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats & History */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card variant="stat">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Latest Discovery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Businesses Found</span>
                  <span className="font-semibold">{discoveryStats.found}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">No Website</span>
                  <span className="font-semibold text-destructive">{discoveryStats.noWebsite}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">With Email</span>
                  <span className="font-semibold text-success">{discoveryStats.withEmail}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Duplicates Filtered</span>
                  <span className="font-semibold">{discoveryStats.duplicates}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Jobs */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="text-base">Recent Jobs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentJobs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No discovery jobs yet. Start your first discovery above.
                  </p>
                ) : (
                  recentJobs.map((job, i) => (
                    <div 
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium text-sm">{job.city}</p>
                        <p className="text-xs text-muted-foreground">{job.category}</p>
                      </div>
                      <div className="text-right">
                        {job.status === "completed" && (
                          <Badge variant="success" className="mb-1">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Done
                          </Badge>
                        )}
                        {job.status === "running" && (
                          <Badge variant="info" className="mb-1">
                            <RotateCw className="w-3 h-3 mr-1 animate-spin" />
                            Running
                          </Badge>
                        )}
                        {job.status === "pending" && (
                          <Badge variant="muted" className="mb-1">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                        {job.status === "failed" && (
                          <Badge variant="destructive" className="mb-1">
                            Failed
                          </Badge>
                        )}
                        <p className="text-xs text-muted-foreground">{job.leads} leads</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Discovery;
