import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Mail, Phone, Zap, ExternalLink, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLeads } from "@/hooks/useLeads";
import { Skeleton } from "@/components/ui/skeleton";
import { LeadScoreBadge } from "./LeadScoreBadge";
import { WebsiteStatusBadge } from "./WebsiteStatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type LeadStatus = Database["public"]["Enums"]["lead_status"];

const statusVariants: Record<LeadStatus, "success" | "info" | "warning" | "muted" | "accent"> = {
  new: "info",
  contacted: "warning",
  qualified: "accent",
  converted: "success",
  unsubscribed: "muted",
};

interface LeadsTableProps {
  selectedLeads?: string[];
  onSelectionChange?: (ids: string[]) => void;
  filters?: {
    search?: string;
    state?: string;
    category?: string;
    websiteStatus?: string;
    leadStatus?: string;
    tier?: string;
  };
}

export function LeadsTable({ selectedLeads = [], onSelectionChange, filters }: LeadsTableProps) {
  const { leads, isLoading, updateLead, deleteLead } = useLeads();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  // Apply filters
  const filteredLeads = leads.filter((lead) => {
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      if (
        !lead.business_name.toLowerCase().includes(search) &&
        !lead.category.toLowerCase().includes(search) &&
        !lead.city.toLowerCase().includes(search)
      ) {
        return false;
      }
    }
    if (filters?.state && filters.state !== "all" && lead.state !== filters.state) {
      return false;
    }
    if (filters?.category && filters.category !== "all" && lead.category !== filters.category) {
      return false;
    }
    if (filters?.websiteStatus && filters.websiteStatus !== "all" && lead.website_status !== filters.websiteStatus) {
      return false;
    }
    if (filters?.leadStatus && filters.leadStatus !== "all" && lead.status !== filters.leadStatus) {
      return false;
    }
    if (filters?.tier && filters.tier !== "all") {
      const leadTier = (lead as any).lead_tier || 
        (lead.score && lead.score >= 70 ? "hot" : lead.score && lead.score >= 40 ? "warm" : "cold");
      if (leadTier !== filters.tier) {
        return false;
      }
    }
    return true;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(filteredLeads.map((lead) => lead.id));
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectLead = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedLeads, id]);
    } else {
      onSelectionChange?.(selectedLeads.filter((leadId) => leadId !== id));
    }
  };

  const handleAnalyze = async (leadId: string) => {
    setAnalyzingId(leadId);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-website", {
        body: { lead_id: leadId },
      });
      
      if (error) throw error;
      
      toast({
        title: "Analysis complete",
        description: `Lead score: ${data.score}, Tier: ${data.lead_tier}`,
      });
    } catch (error: any) {
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAnalyzingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No leads found. Start a discovery to find businesses!</p>
      </div>
    );
  }

  const handleStatusUpdate = (id: string, status: LeadStatus) => {
    updateLead.mutate({ id, status });
  };

  const handleDelete = (id: string) => {
    deleteLead.mutate(id);
  };

  return (
    <div className="rounded-xl border bg-card">
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
            <TableHead>Location</TableHead>
            <TableHead>Website Status</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Lead Score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLeads.map((lead) => (
            <TableRow key={lead.id} className={selectedLeads.includes(lead.id) ? "bg-muted/50" : ""}>
              <TableCell>
                <Checkbox 
                  checked={selectedLeads.includes(lead.id)}
                  onCheckedChange={(checked) => handleSelectLead(lead.id, !!checked)}
                />
              </TableCell>
              <TableCell>
                <div 
                  className="cursor-pointer hover:text-primary transition-colors"
                  onClick={() => navigate(`/dashboard/leads/${lead.id}`)}
                >
                  <p className="font-medium text-foreground">{lead.business_name}</p>
                  <p className="text-sm text-muted-foreground">{lead.category}</p>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground">
                  {lead.city}, {lead.state}
                </span>
              </TableCell>
              <TableCell>
                <WebsiteStatusBadge 
                  status={lead.website_status}
                  hasSSL={(lead as any).has_ssl}
                  isMobileFriendly={(lead as any).is_mobile_friendly}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {lead.email && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      title={lead.email}
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                  )}
                  {lead.phone && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      title={lead.phone}
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                  )}
                  {!lead.email && !lead.phone && (
                    <span className="text-sm text-muted-foreground">No contact</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <LeadScoreBadge 
                  score={lead.score} 
                  tier={(lead as any).lead_tier}
                />
              </TableCell>
              <TableCell>
                <Badge variant={statusVariants[lead.status]}>
                  {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/dashboard/leads/${lead.id}`)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleAnalyze(lead.id)}
                      disabled={analyzingId === lead.id}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      {analyzingId === lead.id ? "Analyzing..." : "Analyze & Score"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {lead.email && (
                      <DropdownMenuItem onClick={() => navigate(`/dashboard/leads/${lead.id}`)}>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </DropdownMenuItem>
                    )}
                    {lead.phone && (
                      <DropdownMenuItem onClick={() => navigate(`/dashboard/leads/${lead.id}`)}>
                        <Phone className="w-4 h-4 mr-2" />
                        Call Lead
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleStatusUpdate(lead.id, "contacted")}>
                      Mark as Contacted
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusUpdate(lead.id, "qualified")}>
                      Mark as Qualified
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusUpdate(lead.id, "converted")}>
                      Mark as Converted
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleDelete(lead.id)}
                    >
                      Remove Lead
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
