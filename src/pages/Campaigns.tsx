import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Mail, 
  Users, 
  TrendingUp,
  Play,
  Pause,
  MoreHorizontal,
  Eye,
  MousePointerClick,
  Reply
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const campaigns = [
  {
    id: 1,
    name: "Texas Restaurant Outreach",
    status: "active",
    sent: 450,
    total: 500,
    opened: 234,
    clicked: 89,
    replied: 23,
    createdAt: "Dec 1, 2024"
  },
  {
    id: 2,
    name: "California Contractors Q4",
    status: "active",
    sent: 280,
    total: 800,
    opened: 156,
    clicked: 45,
    replied: 12,
    createdAt: "Nov 28, 2024"
  },
  {
    id: 3,
    name: "Florida Auto Shops",
    status: "paused",
    sent: 1200,
    total: 1200,
    opened: 678,
    clicked: 234,
    replied: 67,
    createdAt: "Nov 15, 2024"
  },
  {
    id: 4,
    name: "New York Salons",
    status: "completed",
    sent: 350,
    total: 350,
    opened: 189,
    clicked: 78,
    replied: 34,
    createdAt: "Nov 10, 2024"
  },
];

const statusVariants: Record<string, "success" | "warning" | "muted"> = {
  active: "success",
  paused: "warning",
  completed: "muted",
};

const Campaigns = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
            <p className="text-muted-foreground mt-1">
              Manage your email outreach campaigns
            </p>
          </div>
          <Button variant="hero">
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card variant="stat" className="border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">2,280</p>
                  <p className="text-sm text-muted-foreground">Total Sent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="stat" className="border-l-accent">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Eye className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">55.8%</p>
                  <p className="text-sm text-muted-foreground">Open Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="stat" className="border-l-warning">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <MousePointerClick className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">19.5%</p>
                  <p className="text-sm text-muted-foreground">Click Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="stat" className="border-l-success">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Reply className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">5.9%</p>
                  <p className="text-sm text-muted-foreground">Reply Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns List */}
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} variant="interactive">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                      <Mail className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{campaign.name}</h3>
                      <p className="text-sm text-muted-foreground">Created {campaign.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariants[campaign.status]}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </Badge>
                    {campaign.status === "active" ? (
                      <Button variant="outline" size="sm">
                        <Pause className="w-4 h-4 mr-1" />
                        Pause
                      </Button>
                    ) : campaign.status === "paused" ? (
                      <Button variant="outline" size="sm">
                        <Play className="w-4 h-4 mr-1" />
                        Resume
                      </Button>
                    ) : null}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Campaign</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                      {campaign.sent} of {campaign.total} emails sent
                    </span>
                    <span className="font-medium">
                      {Math.round((campaign.sent / campaign.total) * 100)}%
                    </span>
                  </div>
                  <Progress value={(campaign.sent / campaign.total) * 100} className="h-2" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-foreground">{campaign.opened}</p>
                    <p className="text-sm text-muted-foreground">Opened</p>
                    <p className="text-xs text-accent">
                      {Math.round((campaign.opened / campaign.sent) * 100)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-foreground">{campaign.clicked}</p>
                    <p className="text-sm text-muted-foreground">Clicked</p>
                    <p className="text-xs text-warning">
                      {Math.round((campaign.clicked / campaign.sent) * 100)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-foreground">{campaign.replied}</p>
                    <p className="text-sm text-muted-foreground">Replied</p>
                    <p className="text-xs text-success">
                      {Math.round((campaign.replied / campaign.sent) * 100)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Campaigns;
