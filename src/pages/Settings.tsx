import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Building, 
  Mail, 
  Key, 
  Bell, 
  Shield,
  CreditCard,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and integration settings
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input defaultValue="John" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input defaultValue="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" defaultValue="john@agency.com" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input type="tel" defaultValue="(555) 123-4567" />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  Company Information
                </CardTitle>
                <CardDescription>
                  Your company details for email sender identity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input defaultValue="Web Agency Pro" />
                </div>
                <div className="space-y-2">
                  <Label>Company Address</Label>
                  <Input defaultValue="123 Main St, Austin, TX 78701" />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Email Provider
                </CardTitle>
                <CardDescription>
                  Connect your email sending service for outreach campaigns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "SendGrid", connected: true, description: "Recommended for high-volume sending" },
                  { name: "Amazon SES", connected: false, description: "Cost-effective for large campaigns" },
                  { name: "Postmark", connected: false, description: "Best deliverability rates" },
                ].map((provider) => (
                  <div 
                    key={provider.name}
                    className="flex items-center justify-between p-4 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">{provider.name}</p>
                        <p className="text-sm text-muted-foreground">{provider.description}</p>
                      </div>
                    </div>
                    {provider.connected ? (
                      <Badge variant="success">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Button variant="outline" size="sm">
                        Connect
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  API Keys
                </CardTitle>
                <CardDescription>
                  Manage API keys for data source integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Google Places API Key</Label>
                  <div className="flex gap-2">
                    <Input type="password" defaultValue="••••••••••••••••" />
                    <Button variant="outline">Update</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Yelp Fusion API Key</Label>
                  <div className="flex gap-2">
                    <Input type="password" defaultValue="••••••••••••••••" />
                    <Button variant="outline">Update</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Twilio Account SID</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Enter your Twilio SID" />
                    <Button variant="outline">Save</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { title: "New Lead Alerts", description: "Get notified when new leads are discovered", enabled: true },
                  { title: "Email Responses", description: "Alerts when prospects reply to your emails", enabled: true },
                  { title: "Campaign Completion", description: "Notification when a campaign finishes sending", enabled: true },
                  { title: "Weekly Summary", description: "Weekly digest of your lead generation activity", enabled: false },
                  { title: "Bounce Alerts", description: "Immediate alerts for email bounces", enabled: true },
                ].map((notification) => (
                  <div 
                    key={notification.title}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                    </div>
                    <Switch defaultChecked={notification.enabled} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div>
                    <Badge variant="info" className="mb-2">Professional</Badge>
                    <p className="text-2xl font-bold">$149<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                    <p className="text-sm text-muted-foreground mt-1">5,000 leads/month • 5 users</p>
                  </div>
                  <Button variant="outline">Upgrade Plan</Button>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Leads used this month</span>
                    <span className="font-medium">2,847 / 5,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Next billing date</span>
                    <span className="font-medium">January 1, 2025</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Payment method</span>
                    <span className="font-medium">•••• 4242</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Compliance Settings
                </CardTitle>
                <CardDescription>
                  Configure CAN-SPAM and TCPA compliance options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <p className="font-medium">Automatic Unsubscribe Link</p>
                    <p className="text-sm text-muted-foreground">Add unsubscribe link to all emails</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <p className="font-medium">Suppression List Sync</p>
                    <p className="text-sm text-muted-foreground">Automatically sync with global suppression list</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <p className="font-medium">Daily Sending Limit</p>
                    <p className="text-sm text-muted-foreground">Maximum 500 emails per day</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
