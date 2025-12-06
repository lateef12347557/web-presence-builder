import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
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
  Trash2,
  Calendar,
  Zap,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useLeads } from "@/hooks/useLeads";
import { useDiscoveryJobs } from "@/hooks/useDiscoveryJobs";
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
  "Cleaning Services",
  "HVAC",
  "Electricians",
  "Roofing",
  "Pet Services",
  "Fitness",
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
  const [isRecurring, setIsRecurring] = useState(false);
  const [discoveryStats, setDiscoveryStats] = useState({
    found: 0,
    noWebsite: 0,
    withPhone: 0,
    duplicates: 0,
  });

  const { createLead } = useLeads();
  const { jobs, createJob, runJob, deleteJob, isLoading: jobsLoading } = useDiscoveryJobs();

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const selectAllCategories = () => {
    setSelectedCategories(categories);
  };

  const clearCategories = () => {
    setSelectedCategories([]);
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
      let withPhoneCount = 0;

      for (const business of businesses) {
        if (business.website_status === 'none') noWebsiteCount++;
        if (business.phone) withPhoneCount++;

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
          // Duplicate
        }
      }

      setProgress(100);
      
      setDiscoveryStats({
        found: businesses.length,
        noWebsite: noWebsiteCount,
        withPhone: withPhoneCount,
        duplicates: businesses.length - savedCount,
      });

      toast.success(`Discovery complete! Found ${savedCount} new leads`);

      // Schedule recurring job if enabled
      if (isRecurring) {
        await createJob.mutateAsync({
          location,
          categories: selectedCategories,
          is_recurring: true,
        });
        toast.success("Daily recurring job scheduled");
      }
    } catch (error: any) {
      console.error("Discovery error:", error);
      toast.error(error.message || "Discovery failed");
    } finally {
      setIsRunning(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case "running":
        return <Badge variant="info"><RotateCw className="w-3 h-3 mr-1 animate-spin" />Running</Badge>;
      case "pending":
        return <Badge variant="muted"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="muted">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Business Discovery</h1>
            <p className="text-muted-foreground mt-1">
              Find US businesses without websites using Yelp API
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isRunning && (
              <Button variant="outline" onClick={() => setIsRunning(false)}>
                <Pause className="w-4 h-4 mr-2" />
                Stop
              </Button>
            )}
            <Button 
              variant="hero" 
              onClick={startDiscovery}
              disabled={isRunning}
            >
              <Zap className="w-4 h-4 mr-2" />
              {isRunning ? "Discovering..." : "Start Discovery"}
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
                      Scanning {city}, {state} for {selectedCategories.length} categories
                    </p>
                  </div>
                </div>
                <Badge variant="info">In Progress</Badge>
              </div>
              <Progress value={progress} className="h-2 mb-2" />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{progress}% complete</span>
                <span>Processing Yelp data...</span>
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
                  Target specific US cities to find businesses without websites
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input 
                      placeholder="e.g., Austin, Miami, Seattle" 
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
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Daily Automatic Scanning</p>
                      <p className="text-xs text-muted-foreground">Run this search automatically every day</p>
                    </div>
                  </div>
                  <Switch
                    checked={isRecurring}
                    onCheckedChange={setIsRecurring}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Category Selection */}
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      Business Categories
                    </CardTitle>
                    <CardDescription>
                      Select business types to discover ({selectedCategories.length} selected)
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAllCategories}>
                      Select All
                    </Button>
                    <Button variant="ghost" size="sm" onClick={clearCategories}>
                      Clear
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((category) => (
                    <label
                      key={category}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedCategories.includes(category) 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/30"
                      }`}
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

            {/* Data Source */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  Data Sources
                </CardTitle>
                <CardDescription>
                  Business data powered by Yelp Fusion API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-lg border border-primary/30 bg-primary/5">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <div>
                      <span className="font-medium">Yelp Fusion API</span>
                      <p className="text-xs text-muted-foreground">Primary business directory</p>
                    </div>
                  </div>
                  <Badge variant="success">Connected</Badge>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                  <p><strong>Automatic filters applied:</strong></p>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>USA businesses only</li>
                    <li>No website or Yelp-only URL</li>
                    <li>Deduplication by business name + city</li>
                    <li>Lead scoring (no website = 85 points)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats & History */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card variant="stat">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Latest Discovery Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Businesses Found</span>
                  <span className="font-semibold text-lg">{discoveryStats.found}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">No Website</span>
                  <span className="font-semibold text-lg text-destructive">{discoveryStats.noWebsite}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">With Phone</span>
                  <span className="font-semibold text-lg text-success">{discoveryStats.withPhone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Duplicates Filtered</span>
                  <span className="font-semibold text-lg">{discoveryStats.duplicates}</span>
                </div>
              </CardContent>
            </Card>

            {/* Scheduled Jobs */}
            <Card variant="elevated">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Scheduled Jobs</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => runJob.mutate()}
                  disabled={runJob.isPending}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Run Now
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {jobsLoading ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
                ) : jobs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No scheduled jobs. Enable "Daily Automatic Scanning" above.
                  </p>
                ) : (
                  jobs.slice(0, 5).map((job) => (
                    <div 
                      key={job.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{job.location}</p>
                        <p className="text-xs text-muted-foreground">
                          {job.categories.slice(0, 2).join(", ")}
                          {job.categories.length > 2 && ` +${job.categories.length - 2}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(job.status)}
                        {job.is_recurring && (
                          <Badge variant="info" className="text-xs">
                            <RotateCw className="w-2 h-2 mr-1" />
                            Daily
                          </Badge>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => deleteJob.mutate(job.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
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
