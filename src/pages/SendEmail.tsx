import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Mail, 
  Send, 
  Users, 
  Search,
  Filter,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { useTemplates } from "@/hooks/useTemplates";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LeadScoreBadge } from "@/components/dashboard/LeadScoreBadge";

export default function SendEmail() {
  const { leads, isLoading: leadsLoading } = useLeads();
  const { templates, isLoading: templatesLoading } = useTemplates();
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [customSubject, setCustomSubject] = useState("");
  const [customContent, setCustomContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [isSending, setIsSending] = useState(false);

  // Filter leads that have email addresses
  const emailableLeads = leads.filter(lead => lead.email);
  
  const filteredLeads = emailableLeads.filter(lead => {
    const matchesSearch = lead.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === "all" || lead.lead_tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(filteredLeads.map(l => l.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads(prev => [...prev, leadId]);
    } else {
      setSelectedLeads(prev => prev.filter(id => id !== leadId));
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setCustomSubject(template.subject);
      setCustomContent(template.content);
    }
  };

  const handleSendEmails = async () => {
    if (selectedLeads.length === 0) {
      toast({ title: "No leads selected", variant: "destructive" });
      return;
    }

    if (!customSubject || !customContent) {
      toast({ title: "Please provide subject and content", variant: "destructive" });
      return;
    }

    setIsSending(true);
    let successCount = 0;
    let errorCount = 0;

    for (const leadId of selectedLeads) {
      try {
        const { error } = await supabase.functions.invoke("send-campaign-email", {
          body: {
            lead_id: leadId,
            template_id: selectedTemplate || null,
            user_id: user?.id,
          },
        });

        if (error) {
          errorCount++;
          console.error(`Failed to send to lead ${leadId}:`, error);
        } else {
          successCount++;
        }
      } catch (err) {
        errorCount++;
        console.error(`Error sending to lead ${leadId}:`, err);
      }
    }

    setIsSending(false);
    
    if (successCount > 0) {
      toast({ 
        title: "Emails sent", 
        description: `Successfully sent ${successCount} emails${errorCount > 0 ? `, ${errorCount} failed` : ""}` 
      });
      setSelectedLeads([]);
    } else {
      toast({ title: "Failed to send emails", variant: "destructive" });
    }
  };

  const selectedTemplate_ = templates.find(t => t.id === selectedTemplate);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Send Email</h1>
          <p className="text-muted-foreground">Compose and send personalized emails to your leads</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lead Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle>Select Recipients</CardTitle>
                      <CardDescription>{selectedLeads.length} of {emailableLeads.length} leads selected</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search leads..." 
                        className="pl-10 w-[200px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={tierFilter} onValueChange={setTierFilter}>
                      <SelectTrigger className="w-[130px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tiers</SelectItem>
                        <SelectItem value="hot">Hot</SelectItem>
                        <SelectItem value="warm">Warm</SelectItem>
                        <SelectItem value="cold">Cold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {leadsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead>Business</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Tier</TableHead>
                          <TableHead>Location</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLeads.map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedLeads.includes(lead.id)}
                                onCheckedChange={(checked) => handleSelectLead(lead.id, !!checked)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{lead.business_name}</TableCell>
                            <TableCell className="text-muted-foreground">{lead.email}</TableCell>
                            <TableCell>
                              <LeadScoreBadge tier={lead.lead_tier} score={lead.score} />
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {lead.city}, {lead.state}
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredLeads.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No leads with email addresses found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Email Composition */}
          <div className="space-y-6">
            {/* Template Selection */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <CardTitle>Email Template</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
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
                
                {selectedTemplate_ && (
                  <div className="p-3 rounded-lg bg-muted/50 text-sm">
                    <p className="font-medium">{selectedTemplate_.name}</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Category: {selectedTemplate_.category}
                    </p>
                    {selectedTemplate_.response_rate && (
                      <p className="text-muted-foreground text-xs">
                        Response rate: {selectedTemplate_.response_rate}%
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Email Content */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  <CardTitle>Email Content</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input 
                    placeholder="Email subject..."
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea 
                    placeholder="Email content..."
                    className="min-h-[200px]"
                    value={customContent}
                    onChange={(e) => setCustomContent(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Variables: {"{{business_name}}"}, {"{{city}}"}, {"{{state}}"}, {"{{category}}"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Send Button */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {selectedLeads.length > 0 ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Ready to send to {selectedLeads.length} lead{selectedLeads.length > 1 ? "s" : ""}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                      Select leads to send emails
                    </div>
                  )}
                  
                  <Button 
                    className="w-full gap-2" 
                    size="lg"
                    disabled={selectedLeads.length === 0 || isSending || !customSubject || !customContent}
                    onClick={handleSendEmails}
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Emails
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* CAN-SPAM Notice */}
            <Card className="border-warning/50 bg-warning/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">CAN-SPAM Compliance</p>
                    <p className="text-muted-foreground mt-1">
                      All emails include unsubscribe links and comply with CAN-SPAM requirements. 
                      Daily sending limit: 100 emails per domain.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
