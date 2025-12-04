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
  DollarSign,
  Calendar
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

const lineData = [
  { name: "Mon", leads: 45, emails: 120, conversions: 3 },
  { name: "Tue", leads: 52, emails: 145, conversions: 5 },
  { name: "Wed", leads: 38, emails: 98, conversions: 2 },
  { name: "Thu", leads: 67, emails: 180, conversions: 7 },
  { name: "Fri", leads: 54, emails: 156, conversions: 4 },
  { name: "Sat", leads: 23, emails: 45, conversions: 1 },
  { name: "Sun", leads: 18, emails: 32, conversions: 1 },
];

const categoryData = [
  { name: "Restaurants", value: 35 },
  { name: "Contractors", value: 25 },
  { name: "Auto Repair", value: 20 },
  { name: "Salons", value: 12 },
  { name: "Other", value: 8 },
];

const stateData = [
  { state: "TX", leads: 456 },
  { state: "CA", leads: 389 },
  { state: "FL", leads: 312 },
  { state: "NY", leads: 278 },
  { state: "AZ", leads: 234 },
];

const COLORS = ["hsl(221, 83%, 53%)", "hsl(173, 80%, 40%)", "hsl(38, 92%, 50%)", "hsl(142, 76%, 36%)", "hsl(220, 9%, 46%)"];

const Analytics = () => {
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
                  <p className="text-3xl font-bold mt-1">2,847</p>
                  <div className="flex items-center gap-1 mt-2 text-success text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>+12.5%</span>
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
                  <p className="text-3xl font-bold mt-1">8,432</p>
                  <div className="flex items-center gap-1 mt-2 text-success text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>+8.2%</span>
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
                  <p className="text-3xl font-bold mt-1">47</p>
                  <div className="flex items-center gap-1 mt-2 text-destructive text-sm">
                    <TrendingDown className="w-4 h-4" />
                    <span>-2.4%</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-success">
                  <Target className="w-6 h-6 text-success-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-3xl font-bold mt-1">$23,500</p>
                  <div className="flex items-center gap-1 mt-2 text-success text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>+18.7%</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-warning">
                  <DollarSign className="w-6 h-6 text-warning-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Line Chart */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData}>
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
                  />
                  <Line 
                    type="monotone" 
                    dataKey="emails" 
                    stroke="hsl(173, 80%, 40%)" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(173, 80%, 40%)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart */}
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
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="text-sm text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card variant="elevated" className="lg:col-span-2">
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
