import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Star,
  Shield,
  Smartphone,
  Gauge,
  Send,
  PhoneCall,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  MessageSquare,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { useTemplates } from "@/hooks/useTemplates";
import { useCallLogs } from "@/hooks/useCallLogs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LeadScoreBadge } from "@/components/dashboard/LeadScoreBadge";
import { WebsiteStatusBadge } from "@/components/dashboard/WebsiteStatusBadge";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type CallOutcome = Database["public"]["Enums"]["call_outcome"];

export default function LeadDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { leads, isLoading, updateLead } = useLeads();
  const { templates } = useTemplates();
  const { callLogs, createCallLog } = useCallLogs();
  const { user } = useAuth();
  const { toast } = useToast();

  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  // Call log state
  const [callOutcome, setCallOutcome] = useState<CallOutcome>("no_answer");
  const [callDuration, setCallDuration] = useState("");
  const [callNotes, setCallNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [isSavingCall, setIsSavingCall] = useState(false);

  const lead = leads.find(l => l.id === id);
  const leadCallLogs = callLogs.filter(log => log.lead_id === id);

  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        setEmailSubject(template.subject);
        setEmailContent(template.content);
      }
    }
  }, [selectedTemplate, templates]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!lead) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertCircle className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground">Lead not found</p>
          <Button onClick={() => navigate("/dashboard/leads")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leads
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleSendEmail = async () => {
    if (!emailSubject || !emailContent) {
      toast({ title: "Please provide subject and content", variant: "destructive" });
      return;
    }

    if (!lead.email) {
      toast({ title: "This lead has no email address", variant: "destructive" });
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-campaign-email", {
        body: {
          lead_id: lead.id,
          template_id: selectedTemplate || null,
          user_id: user?.id,
          custom_subject: emailSubject,
          custom_content: emailContent,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "Email sent successfully" });
      setIsEmailDialogOpen(false);
      setEmailSubject("");
      setEmailContent("");
      setSelectedTemplate("");
    } catch (err: any) {
      console.error("Email send error:", err);
      toast({ title: "Failed to send email", description: err.message, variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveCall = async () => {
    if (!callOutcome) {
      toast({ title: "Please select an outcome", variant: "destructive" });
      return;
    }

    setIsSavingCall(true);
    try {
      // Parse duration to seconds
      let durationSeconds: number | null = null;
      if (callDuration) {
        const parts = callDuration.split(":");
        if (parts.length === 2) {
          durationSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
      }

      await createCallLog.mutateAsync({
        lead_id: lead.id,
        outcome: callOutcome,
        duration_seconds: durationSeconds,
        notes: callNotes || null,
        follow_up_date: followUpDate || null,
      });

      toast({ title: "Call logged successfully" });
      setIsCallDialogOpen(false);
      setCallOutcome("no_answer");
      setCallDuration("");
      setCallNotes("");
      setFollowUpDate("");
    } catch (err: any) {
      toast({ title: "Failed to log call", description: err.message, variant: "destructive" });
    } finally {
      setIsSavingCall(false);
    }
  };

  const handleStartCall = () => {
    // Open phone dialer on mobile, or show call dialog
    if (lead.phone) {
      window.open(`tel:${lead.phone}`, "_self");
    }
    setIsCallDialogOpen(true);
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case "interested":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "callback":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "not_interested":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Phone className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case "interested":
        return <Badge variant="success">Interested</Badge>;
      case "callback":
        return <Badge variant="warning">Callback</Badge>;
      case "not_interested":
        return <Badge variant="destructive">Not Interested</Badge>;
      case "voicemail":
        return <Badge variant="secondary">Voicemail</Badge>;
      case "no_answer":
        return <Badge variant="muted">No Answer</Badge>;
      case "wrong_number":
        return <Badge variant="destructive">Wrong Number</Badge>;
      default:
        return <Badge>{outcome}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/leads")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{lead.business_name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{lead.category}</Badge>
                <LeadScoreBadge tier={lead.lead_tier} score={lead.score} />
                <WebsiteStatusBadge status={lead.website_status} />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleStartCall}
              disabled={!lead.phone}
            >
              <PhoneCall className="w-4 h-4" />
              Call
            </Button>
            <Button 
              className="gap-2"
              onClick={() => setIsEmailDialogOpen(true)}
              disabled={!lead.email}
            >
              <Send className="w-4 h-4" />
              Send Email
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{lead.city}, {lead.state}</p>
                    </div>
                  </div>
                  
                  {lead.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <a href={`mailto:${lead.email}`} className="font-medium text-primary hover:underline">
                          {lead.email}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {lead.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <a href={`tel:${lead.phone}`} className="font-medium font-mono text-primary hover:underline">
                          {lead.phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {lead.google_rating && (
                    <div className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Google Rating</p>
                        <p className="font-medium">{lead.google_rating} ({lead.review_count} reviews)</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Added</p>
                      <p className="font-medium">{format(new Date(lead.created_at), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Source</p>
                      <p className="font-medium">{lead.source || "Manual Entry"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Website Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Website Analysis
                </CardTitle>
                <CardDescription>
                  Technical details about the business's online presence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <Shield className={`w-6 h-6 mx-auto mb-2 ${lead.has_ssl ? 'text-green-500' : 'text-red-500'}`} />
                    <p className="text-sm font-medium">{lead.has_ssl ? 'Has SSL' : 'No SSL'}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <Smartphone className={`w-6 h-6 mx-auto mb-2 ${lead.is_mobile_friendly ? 'text-green-500' : 'text-red-500'}`} />
                    <p className="text-sm font-medium">{lead.is_mobile_friendly ? 'Mobile Friendly' : 'Not Mobile Friendly'}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <Gauge className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Speed: {lead.website_speed_score ?? 'N/A'}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <MessageSquare className={`w-6 h-6 mx-auto mb-2 ${lead.has_social_presence ? 'text-green-500' : 'text-muted-foreground'}`} />
                    <p className="text-sm font-medium">{lead.has_social_presence ? 'Has Social' : 'No Social'}</p>
                  </div>
                </div>
                
                {lead.last_analyzed_at && (
                  <p className="text-xs text-muted-foreground mt-4">
                    Last analyzed: {format(new Date(lead.last_analyzed_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Call History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Call History
                </CardTitle>
                <CardDescription>
                  Previous phone interactions with this lead
                </CardDescription>
              </CardHeader>
              <CardContent>
                {leadCallLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No call history yet. Click "Call" to log your first call.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {leadCallLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                        {getOutcomeIcon(log.outcome)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {getOutcomeBadge(log.outcome)}
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(log.created_at), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                          </div>
                          {log.duration_seconds && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Duration: {Math.floor(log.duration_seconds / 60)}:{String(log.duration_seconds % 60).padStart(2, '0')}
                            </p>
                          )}
                          {log.notes && (
                            <p className="text-sm mt-2">{log.notes}</p>
                          )}
                          {log.follow_up_date && (
                            <p className="text-sm text-primary mt-1">
                              Follow-up: {format(new Date(log.follow_up_date), "MMM d, yyyy")}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start gap-2" 
                  variant="outline"
                  onClick={() => setIsEmailDialogOpen(true)}
                  disabled={!lead.email}
                >
                  <Mail className="w-4 h-4" />
                  Send Email
                </Button>
                <Button 
                  className="w-full justify-start gap-2" 
                  variant="outline"
                  onClick={handleStartCall}
                  disabled={!lead.phone}
                >
                  <PhoneCall className="w-4 h-4" />
                  Make Call
                </Button>
                {lead.email && (
                  <Button 
                    className="w-full justify-start gap-2" 
                    variant="outline"
                    asChild
                  >
                    <a href={`mailto:${lead.email}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                      Open in Email Client
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Lead Score */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">
                    {lead.score ?? 0}
                  </div>
                  <LeadScoreBadge tier={lead.lead_tier} score={lead.score} />
                  <p className="text-sm text-muted-foreground mt-4">
                    Based on website status, contact availability, and business indicators.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Add notes about this lead..."
                  defaultValue={lead.notes || ""}
                  className="min-h-[100px]"
                  onBlur={(e) => {
                    if (e.target.value !== lead.notes) {
                      updateLead.mutate({ id: lead.id, notes: e.target.value });
                    }
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Send Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Email to {lead.business_name}</DialogTitle>
            <DialogDescription>
              Compose and send a personalized email to this lead
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Template (Optional)</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.filter(t => t.is_active).map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input 
                placeholder="Email subject..."
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea 
                placeholder="Email content..."
                className="min-h-[200px]"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Variables: {"{{business_name}}"}, {"{{city}}"}, {"{{state}}"}, {"{{category}}"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} disabled={isSending} className="gap-2">
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Call Dialog */}
      <Dialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Call with {lead.business_name}</DialogTitle>
            <DialogDescription>
              Record the outcome of your phone call
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {lead.phone && (
              <div className="p-3 rounded-lg bg-muted/50 flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <span className="font-mono">{lead.phone}</span>
                <Button size="sm" variant="ghost" asChild className="ml-auto">
                  <a href={`tel:${lead.phone}`}>
                    <PhoneCall className="w-4 h-4 mr-1" />
                    Dial
                  </a>
                </Button>
              </div>
            )}
            <div className="space-y-2">
              <Label>Call Outcome</Label>
              <Select value={callOutcome} onValueChange={(v) => setCallOutcome(v as CallOutcome)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="callback">Callback Requested</SelectItem>
                  <SelectItem value="not_interested">Not Interested</SelectItem>
                  <SelectItem value="no_answer">No Answer</SelectItem>
                  <SelectItem value="voicemail">Left Voicemail</SelectItem>
                  <SelectItem value="wrong_number">Wrong Number</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Call Duration (mm:ss)</Label>
              <Input 
                placeholder="e.g., 5:30"
                value={callDuration}
                onChange={(e) => setCallDuration(e.target.value)}
              />
            </div>
            {callOutcome === "callback" && (
              <div className="space-y-2">
                <Label>Follow-up Date</Label>
                <Input 
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                placeholder="Add any relevant notes about the call..."
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCallDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCall} disabled={isSavingCall} className="gap-2">
              {isSavingCall ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Save Call Log
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
