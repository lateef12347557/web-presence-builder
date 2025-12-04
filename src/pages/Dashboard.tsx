import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Mail, 
  TrendingUp, 
  Target,
  Plus,
  Download,
  Filter
} from "lucide-react";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's what's happening with your leads.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="hero">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Leads"
            value="2,847"
            change="+12.5% from last month"
            changeType="positive"
            icon={Users}
            iconColor="gradient-primary"
          />
          <StatsCard
            title="Emails Sent"
            value="1,234"
            change="+8.2% from last week"
            changeType="positive"
            icon={Mail}
            iconColor="bg-accent"
          />
          <StatsCard
            title="Response Rate"
            value="12.4%"
            change="+2.1% from last month"
            changeType="positive"
            icon={TrendingUp}
            iconColor="bg-success"
          />
          <StatsCard
            title="Conversions"
            value="47"
            change="$23,500 revenue"
            changeType="neutral"
            icon={Target}
            iconColor="bg-warning"
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Leads Table */}
          <div className="lg:col-span-2">
            <Card variant="elevated">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Leads</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <LeadsTable />
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          <div>
            <RecentActivity />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
