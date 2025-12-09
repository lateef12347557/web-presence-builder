import { useState, useEffect } from "react";
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
  AlertCircle,
  Loader2,
  Save
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useDailySendLimits } from "@/hooks/useDailySendLimits";

const Settings = () => {
  const { profile, isLoading, updateProfile } = useProfile();
  const { limits } = useDailySendLimits();
  
  // Profile form state
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  
  // Load profile data into form
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setCompanyName(profile.company_name || "");
      setCompanyAddress(profile.company_address || "");
      setSenderEmail(profile.sender_email || "");
      setSenderName(profile.sender_name || "");
    }
  }, [profile]);

  const handleSaveProfile = () => {
    updateProfile.mutate({
      full_name: fullName,
      company_name: companyName,
      company_address: companyAddress,
    });
  };

  const handleSaveEmailSettings = () => {
    updateProfile.mutate({
      sender_email: senderEmail,
      sender_name: senderName,
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

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
            <TabsTrigger value="email">Email Settings</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
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
                  Update your personal details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <Button 
                  onClick={handleSaveProfile}
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  Company Information
                </CardTitle>
                <CardDescription>
                  Your company details for email sender identity (CAN-SPAM compliance)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your Company LLC"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company Address</Label>
                  <Input 
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="123 Main St, Austin, TX 78701"
                  />
                  <p className="text-xs text-muted-foreground">
                    Required for CAN-SPAM compliance in outreach emails
                  </p>
                </div>
                <Button 
                  onClick={handleSaveProfile}
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Settings Tab */}
          <TabsContent value="email" className="space-y-6">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  SendGrid Sender Configuration
                </CardTitle>
                <CardDescription>
                  Configure your verified sender email address for outreach campaigns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-600">Important: Verify Your Sender</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Before sending emails, you must verify your sender identity in SendGrid. 
                        Go to <a href="https://app.sendgrid.com/settings/sender_auth" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">SendGrid Sender Authentication</a> to verify your domain or create a Single Sender.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Sender Email Address</Label>
                  <Input 
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="outreach@yourdomain.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be a verified sender in your SendGrid account
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Sender Name</Label>
                  <Input 
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Your Name or Company Name"
                  />
                  <p className="text-xs text-muted-foreground">
                    This name will appear in the "From" field of your emails
                  </p>
                </div>

                <Button 
                  onClick={handleSaveEmailSettings}
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Email Settings
                </Button>

                {senderEmail && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">
                      Sender configured: {senderEmail}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Sending Limits
                </CardTitle>
                <CardDescription>
                  Your daily email sending limits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div>
                      <p className="font-medium">Daily Limit</p>
                      <p className="text-sm text-muted-foreground">Maximum emails per day</p>
                    </div>
                    <span className="text-2xl font-bold">{limits?.daily_limit || 100}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div>
                      <p className="font-medium">Sent Today</p>
                      <p className="text-sm text-muted-foreground">Emails sent so far</p>
                    </div>
                    <span className="text-2xl font-bold">{limits?.sent_today || 0}</span>
                  </div>
                </div>
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
                  Your connected email sending service
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">SendGrid</p>
                      <p className="text-sm text-muted-foreground">High-volume email sending</p>
                    </div>
                  </div>
                  <Badge variant="success">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  API Integrations
                </CardTitle>
                <CardDescription>
                  Connected data source APIs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">Yelp Fusion API</p>
                      <p className="text-sm text-muted-foreground">Business discovery</p>
                    </div>
                  </div>
                  <Badge variant="success">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">Hunter.io</p>
                      <p className="text-sm text-muted-foreground">Email discovery</p>
                    </div>
                  </div>
                  <Badge variant="success">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
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
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
