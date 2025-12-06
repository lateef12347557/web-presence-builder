import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Mail, 
  TrendingUp,
  Play,
  Pause,
  MoreHorizontal,
  Eye,
  MousePointerClick,
  Reply,
  Send,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEmailLogs } from "@/hooks/useEmailLogs";
import { useDailySendLimits } from "@/hooks/useDailySendLimits";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useTemplates } from "@/hooks/useTemplates";
import { useLeads } from "@/hooks/useLeads";
import { toast } from "sonner";

const statusVariants: Record<string, "success" | "warning" | "muted"> = {
  active: "success",
  paused: "warning",
  completed: "muted",
  draft: "muted",
};

const Campaigns = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  
  const { stats, sendEmail } = useEmailLogs();
  const { limits, remaining } = useDailySendLimits();
  const { campaigns, isLoading, createCampaign, updateCampaign, deleteCampaign } = useCampaigns();
  const { templates } = useTemplates();
  const { leads } = useLeads();

  const handleCreateCampaign = async () => {
    if (!newCampaignName.trim()) {
      toast.error("Please enter a campaign name");
      return;
    }

    try {
      await createCampaign.mutateAsync({
        name: newCampaignName,
        template_id: selectedTemplateId || null,
        status: "draft",
      });
      setIsCreateOpen(false);
      setNewCampaignName("");
      setSelectedTemplateId("");
    } catch (error) {
      // Error handled by hook
    }
  };

  const handlePauseCampaign = async (id: string) => {
    await updateCampaign.mutateAsync({ id, status: "paused" });
  };

  const handleResumeCampaign = async (id: string) => {
    await updateCampaign.mutateAsync({ id, status: "active" });
  };

  const handleSendToLead = async (leadId: string, templateId?: string) => {
    await sendEmail.mutateAsync({ leadId, templateId });
  };

  const openRate = stats.sent > 0 ? ((stats.opened / stats.sent) * 100).toFixed(1) : "0";
  const clickRate = stats.sent > 0 ? ((stats.clicked / stats.sent) * 100).toFixed(1) : "0";
  const replyRate = stats.sent > 0 ? ((stats.replied / stats.sent) * 100).toFixed(1) : "0";

  // Get leads that can be emailed
  const emailableLeads = leads.filter(l => l.email && l.status !== "unsubscribed");

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Email Campaigns</h1>
            <p className="text-muted-foreground mt-1">
              Manage your CAN-SPAM compliant email outreach
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="hero">
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
                <DialogDescription>
                  Set up a new email outreach campaign for your leads.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Campaign Name</Label>
                  <Input
                    placeholder="e.g., Texas Restaurant Outreach"
                    value={newCampaignName}
                    onChange={(e) => setNewCampaignName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Template</Label>
                  <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCampaign} disabled={createCampaign.isPending}>
                  Create Campaign
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Daily Limit Warning */}
        {remaining < 20 && (
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-warning" />
              <div>
                <p className="font-medium text-warning">Daily Send Limit Warning</p>
                <p className="text-sm text-muted-foreground">
                  You have {remaining} emails remaining today (limit: {limits?.daily_limit || 100})
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card variant="stat" className="border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.sent}</p>
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
                  <p className="text-2xl font-bold">{openRate}%</p>
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
                  <p className="text-2xl font-bold">{clickRate}%</p>
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
                  <p className="text-2xl font-bold">{replyRate}%</p>
                  <p className="text-sm text-muted-foreground">Reply Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="stat" className="border-l-muted">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Send className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{remaining}</p>
                  <p className="text-sm text-muted-foreground">Remaining Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Send Section */}
        {emailableLeads.length > 0 && (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">Quick Send</CardTitle>
              <CardDescription>
                Send emails to leads with email addresses ({emailableLeads.length} available)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {emailableLeads.slice(0, 5).map((lead) => (
                  <Button
                    key={lead.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendToLead(lead.id)}
                    disabled={sendEmail.isPending || remaining === 0}
                  >
                    <Send className="w-3 h-3 mr-2" />
                    {lead.business_name}
                  </Button>
                ))}
                {emailableLeads.length > 5 && (
                  <Badge variant="muted">+{emailableLeads.length - 5} more</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Campaigns List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Campaigns</h2>
          {isLoading ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Loading campaigns...</CardContent></Card>
          ) : campaigns.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No campaigns yet</h3>
                <p className="text-muted-foreground mb-4">Create your first campaign to start reaching out to leads.</p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </CardContent>
            </Card>
          ) : (
            campaigns.map((campaign) => (
              <Card key={campaign.id} variant="interactive">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                        <Mail className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{campaign.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(campaign.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={statusVariants[campaign.status] || "muted"}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </Badge>
                      {campaign.status === "active" ? (
                        <Button variant="outline" size="sm" onClick={() => handlePauseCampaign(campaign.id)}>
                          <Pause className="w-4 h-4 mr-1" />
                          Pause
                        </Button>
                      ) : campaign.status === "paused" ? (
                        <Button variant="outline" size="sm" onClick={() => handleResumeCampaign(campaign.id)}>
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
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => deleteCampaign.mutate(campaign.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">
                        {campaign.sent_count} of {campaign.total_leads} emails sent
                      </span>
                      <span className="font-medium">
                        {campaign.total_leads > 0 
                          ? Math.round((campaign.sent_count / campaign.total_leads) * 100)
                          : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={campaign.total_leads > 0 
                        ? (campaign.sent_count / campaign.total_leads) * 100 
                        : 0
                      } 
                      className="h-2" 
                    />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-foreground">{campaign.open_count}</p>
                      <p className="text-sm text-muted-foreground">Opened</p>
                      <p className="text-xs text-accent">
                        {campaign.sent_count > 0 
                          ? Math.round((campaign.open_count / campaign.sent_count) * 100)
                          : 0}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-foreground">{campaign.response_count}</p>
                      <p className="text-sm text-muted-foreground">Responded</p>
                      <p className="text-xs text-success">
                        {campaign.sent_count > 0 
                          ? Math.round((campaign.response_count / campaign.sent_count) * 100)
                          : 0}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-foreground">{campaign.total_leads}</p>
                      <p className="text-sm text-muted-foreground">Total Leads</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Campaigns;
