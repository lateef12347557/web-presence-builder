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
  AlertCircle
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

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

const sources = [
  { name: "Google Places", enabled: true },
  { name: "Yelp", enabled: true },
  { name: "Yellow Pages", enabled: false },
  { name: "Bing Places", enabled: true },
];

const Discovery = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(45);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Discovery</h1>
            <p className="text-muted-foreground mt-1">
              Configure and run automated business discovery
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setIsRunning(false)}>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
            <Button variant="hero" onClick={() => setIsRunning(true)}>
              <Play className="w-4 h-4 mr-2" />
              Start Discovery
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
                    <p className="text-sm text-muted-foreground">Scanning Austin, TX - Restaurants</p>
                  </div>
                </div>
                <Badge variant="info">In Progress</Badge>
              </div>
              <Progress value={progress} className="h-2 mb-2" />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{progress}% complete</span>
                <span>~12 minutes remaining</span>
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
                    <Input placeholder="e.g., Austin" />
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TX">Texas</SelectItem>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="FL">Florida</SelectItem>
                        <SelectItem value="NY">New York</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Search Radius</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select radius" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 miles</SelectItem>
                      <SelectItem value="25">25 miles</SelectItem>
                      <SelectItem value="50">50 miles</SelectItem>
                      <SelectItem value="100">100 miles</SelectItem>
                    </SelectContent>
                  </Select>
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
                      <Checkbox />
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
                  Data Sources
                </CardTitle>
                <CardDescription>
                  Choose which platforms to scan for business listings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sources.map((source) => (
                    <label
                      key={source.name}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox defaultChecked={source.enabled} />
                        <span className="font-medium">{source.name}</span>
                      </div>
                      {source.enabled ? (
                        <Badge variant="success">Connected</Badge>
                      ) : (
                        <Badge variant="muted">Setup Required</Badge>
                      )}
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats & History */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card variant="stat">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Today's Discovery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Businesses Found</span>
                  <span className="font-semibold">234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">No Website</span>
                  <span className="font-semibold text-destructive">89</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">With Email</span>
                  <span className="font-semibold text-success">156</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Duplicates Filtered</span>
                  <span className="font-semibold">12</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Jobs */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="text-base">Recent Jobs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { city: "Austin, TX", category: "Plumbing", status: "completed", leads: 45 },
                  { city: "Phoenix, AZ", category: "Restaurants", status: "completed", leads: 78 },
                  { city: "Denver, CO", category: "Auto Repair", status: "running", leads: 23 },
                  { city: "Seattle, WA", category: "Landscaping", status: "pending", leads: 0 },
                ].map((job, i) => (
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
                      <p className="text-xs text-muted-foreground">{job.leads} leads</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Discovery;
