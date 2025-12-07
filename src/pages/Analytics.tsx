import { useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  Mail,
  Target,
  Flame,
  Calendar,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useLeads } from "@/hooks/useLeads";
import { useEmailLogs } from "@/hooks/useEmailLogs";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["hsl(221, 83%, 53%)", "hsl(173, 80%, 40%)", "hsl(38, 92%, 50%)", "hsl(142, 76%, 36%)", "hsl(220, 9%, 46%)"];

const Analytics = () => {
  const { leads, isLoading: leadsLoading } = useLeads();
  const { emailLogs, isLoading: emailsLoading } = useEmailLogs();

  // Calculate lead stats
  const leadStats = useMemo(() => {
    const total = leads.length;
    const hot = leads.filter(l => (l as any).lead_tier === "hot" || (l.score && l.score >= 70)).length;
    const converted = leads.filter(l => l.status === "converted").length;
    const contacted = leads.filter(l => l.status === "contacted" || l.status === "qualified" || l.status === "converted").length;
    
    return { total, hot, converted, contacted };
  }, [leads]);

  // Calculate email stats
  const emailStats = useMemo(() => {
    const total = emailLogs.length;
    const opened = emailLogs.filter(e => e.opened_at).length;
    const clicked = emailLogs.filter(e => e.clicked_at).length;
    const replied = emailLogs.filter(e => e.replied_at).length;
    const bounced = emailLogs.filter(e => e.bounced_at).length;
    
    const openRate = total > 0 ? ((opened / total) * 100).toFixed(1) : "0";
    const clickRate = opened > 0 ? ((clicked / opened) * 100).toFixed(1) : "0";
    const replyRate = total > 0 ? ((replied / total) * 100).toFixed(1) : "0";
    
    return { total, opened, clicked, replied, bounced, openRate, clickRate, replyRate };
  }, [emailLogs]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach(lead => {
      counts[lead.category] = (counts[lead.category] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [leads]);

  // State breakdown
  const stateData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach(lead => {
      counts[lead.state] = (counts[lead.state] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([state, leads]) => ({ state, leads }))
      .sort((a, b) => b.leads - a.leads)
      .slice(0, 8);
  }, [leads]);

  // Lead tier breakdown
  const tierData = useMemo(() => {
    const hot = leads.filter(l => (l as any).lead_tier === "hot" || (l.score && l.score >= 70)).length;
    const warm = leads.filter(l => (l as any).lead_tier === "warm" || (l.score && l.score >= 40 && l.score < 70)).length;
    const cold = leads.filter(l => (l as any).lead_tier === "cold" || !l.score || l.score < 40).length;
    
    return [
      { name: "Hot", value: hot, color: "hsl(0, 84%, 60%)" },
      { name: "Warm", value: warm, color: "hsl(38, 92%, 50%)" },
      { name: "Cold", value: cold, color: "hsl(210, 40%, 70%)" },
    ];
  }, [leads]);

  // Daily activity (last 7 days)
  const dailyData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      
      const leadsCount = leads.filter(l => 
        l.created_at.split("T")[0] === dateStr
      ).length;
      
      const emailsCount = emailLogs.filter(e => 
        e.created_at.split("T")[0] === dateStr
      ).length;
      
      days.push({ name: dayName, leads: leadsCount, emails: emailsCount });
    }
    return days;
  }, [leads, emailLogs]);

  const isLoading = leadsLoading || emailsLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Track your lead generation and outreach performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select defaultValue="7d">
              <SelectTrigger className="w-[180px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Export Report</Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Leads</p>
                  <p className="text-3xl font-bold mt-1">{leadStats.total.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2 text-sm">
                    <Flame className="w-4 h-4 text-destructive" />
                    <span className="text-destructive">{leadStats.hot} hot leads</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl gradient-primary">
                  <Users className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Emails Sent</p>
                  <p className="text-3xl font-bold mt-1">{emailStats.total.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2 text-success text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>{emailStats.openRate}% open rate</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-accent">
                  <Mail className="w-6 h-6 text-accent-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversions</p>
                  <p className="text-3xl font-bold mt-1">{leadStats.converted}</p>
                  <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                    <Target className="w-4 h-4" />
                    <span>
                      {leadStats.total > 0 
                        ? ((leadStats.converted / leadStats.total) * 100).toFixed(1)
                        : 0}% rate
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-success">
                  <CheckCircle2 className="w-6 h-6 text-success-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reply Rate</p>
                  <p className="text-3xl font-bold mt-1">{emailStats.replyRate}%</p>
                  <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                    <span>{emailStats.replied} replies received</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-warning">
                  <TrendingUp className="w-6 h-6 text-warning-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email Performance Alert */}
        {emailStats.bounced > 0 && (
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">
                    {emailStats.bounced} emails bounced
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Consider cleaning your lead list to improve deliverability
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Line Chart */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="leads" 
                    stroke="hsl(221, 83%, 53%)" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(221, 83%, 53%)" }}
                    name="New Leads"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="emails" 
                    stroke="hsl(173, 80%, 40%)" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(173, 80%, 40%)" }}
                    name="Emails Sent"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Lead Tier Pie Chart */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Lead Quality Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={tierData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {tierData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {tierData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {entry.name} ({entry.value})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category Pie Chart */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Leads by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {categoryData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart - States */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Leads by State</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="state" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar 
                    dataKey="leads" 
                    fill="hsl(221, 83%, 53%)" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
