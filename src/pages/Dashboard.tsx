import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Mail, 
  TrendingUp, 
  Target,
  Plus,
  Download,
  Filter,
  Globe,
  Phone,
  Zap,
} from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { useEmailLogs } from "@/hooks/useEmailLogs";
import { useDailySendLimits } from "@/hooks/useDailySendLimits";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { leads } = useLeads();
  const { stats } = useEmailLogs();
  const { remaining, limits } = useDailySendLimits();

  // Calculate stats
  const totalLeads = leads.length;
  const noWebsiteLeads = leads.filter(l => l.website_status === "none").length;
  const leadsWithPhone = leads.filter(l => l.phone).length;
  const leadsWithEmail = leads.filter(l => l.email).length;
  const highScoreLeads = leads.filter(l => (l.score || 0) >= 80).length;

  const responseRate = stats.sent > 0 
    ? ((stats.replied / stats.sent) * 100).toFixed(1) 
    : "0";

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              USA Business Lead Finder - Find businesses without websites
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link to="/discovery">
                <Zap className="w-4 h-4 mr-2" />
                Start Discovery
              </Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/campaigns">
                <Mail className="w-4 h-4 mr-2" />
                Send Emails
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatsCard
            title="Total Leads"
            value={totalLeads.toString()}
            change={`${highScoreLeads} high priority`}
            changeType="positive"
            icon={Users}
            iconColor="gradient-primary"
          />
          <StatsCard
            title="No Website"
            value={noWebsiteLeads.toString()}
            change={`${totalLeads > 0 ? ((noWebsiteLeads / totalLeads) * 100).toFixed(0) : 0}% of leads`}
            changeType="positive"
            icon={Globe}
            iconColor="bg-destructive"
          />
          <StatsCard
            title="With Phone"
            value={leadsWithPhone.toString()}
            change="Ready to call"
            changeType="neutral"
            icon={Phone}
            iconColor="bg-success"
          />
          <StatsCard
            title="Emails Sent"
            value={stats.sent.toString()}
            change={`${remaining} remaining today`}
            changeType="neutral"
            icon={Mail}
            iconColor="bg-accent"
          />
          <StatsCard
            title="Response Rate"
            value={`${responseRate}%`}
            change={`${stats.replied} replies`}
            changeType="positive"
            icon={TrendingUp}
            iconColor="bg-success"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/discovery">
            <Card variant="interactive" className="cursor-pointer hover:border-primary/50">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">Discover Leads</h3>
                  <p className="text-sm text-muted-foreground">Find businesses via Yelp API</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/leads">
            <Card variant="interactive" className="cursor-pointer hover:border-primary/50">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">View All Leads</h3>
                  <p className="text-sm text-muted-foreground">{totalLeads} leads in database</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/templates">
            <Card variant="interactive" className="cursor-pointer hover:border-primary/50">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">Email Templates</h3>
                  <p className="text-sm text-muted-foreground">Create outreach messages</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Leads Table */}
          <div className="lg:col-span-2">
            <Card variant="elevated">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Leads</CardTitle>
                  <p className="text-sm text-muted-foreground">Businesses without websites</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/leads">
                      View All
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <LeadsTable />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Email Stats */}
            <Card variant="stat">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Email Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sent Today</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{limits?.sent_today || 0}</span>
                    <Badge variant="muted">/ {limits?.daily_limit || 100}</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Sent</span>
                  <span className="font-semibold">{stats.sent}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Opened</span>
                  <span className="font-semibold text-accent">{stats.opened}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Replied</span>
                  <span className="font-semibold text-success">{stats.replied}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Bounced</span>
                  <span className="font-semibold text-destructive">{stats.bounced}</span>
                </div>
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <RecentActivity />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
