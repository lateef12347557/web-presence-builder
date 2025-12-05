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
import { MoreHorizontal, Mail, Phone } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLeads } from "@/hooks/useLeads";
import { Skeleton } from "@/components/ui/skeleton";
import type { Database } from "@/integrations/supabase/types";

type LeadStatus = Database["public"]["Enums"]["lead_status"];
type WebsiteStatus = Database["public"]["Enums"]["website_status"];

const statusVariants: Record<LeadStatus, "success" | "info" | "warning" | "muted" | "accent"> = {
  new: "info",
  contacted: "warning",
  qualified: "accent",
  converted: "success",
  unsubscribed: "muted",
};

const websiteStatusLabels: Record<WebsiteStatus, string> = {
  none: "No Website",
  broken: "Broken",
  outdated: "Outdated",
};

export function LeadsTable() {
  const { leads, isLoading, updateLead, deleteLead } = useLeads();

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
              <Checkbox />
            </TableHead>
            <TableHead>Business</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Website Status</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>
                <Checkbox />
              </TableCell>
              <TableCell>
                <div>
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
                <Badge 
                  variant={lead.website_status === "none" ? "destructive" : "warning"}
                  className="font-normal"
                >
                  {websiteStatusLabels[lead.website_status]}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {lead.email && (
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Mail className="w-4 h-4" />
                    </Button>
                  )}
                  {lead.phone && (
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Phone className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-2 rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full rounded-full gradient-primary"
                      style={{ width: `${lead.score || 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground">{lead.score || 0}</span>
                </div>
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
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Send Email</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusUpdate(lead.id, "contacted")}>
                      Mark as Contacted
                    </DropdownMenuItem>
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
