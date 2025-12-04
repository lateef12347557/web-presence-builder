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
import { MoreHorizontal, ExternalLink, Mail, Phone } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Lead {
  id: string;
  businessName: string;
  category: string;
  city: string;
  state: string;
  email: string | null;
  phone: string | null;
  websiteStatus: "none" | "broken" | "outdated";
  score: number;
  status: "new" | "contacted" | "responded" | "converted" | "unsubscribed";
}

const mockLeads: Lead[] = [
  {
    id: "1",
    businessName: "Joe's Plumbing Services",
    category: "Plumbing",
    city: "Austin",
    state: "TX",
    email: "joe@example.com",
    phone: "(512) 555-0123",
    websiteStatus: "none",
    score: 92,
    status: "new",
  },
  {
    id: "2",
    businessName: "Maria's Mexican Restaurant",
    category: "Restaurant",
    city: "Phoenix",
    state: "AZ",
    email: "maria@example.com",
    phone: "(480) 555-0456",
    websiteStatus: "broken",
    score: 85,
    status: "contacted",
  },
  {
    id: "3",
    businessName: "Smith Auto Repair",
    category: "Auto Repair",
    city: "Denver",
    state: "CO",
    email: null,
    phone: "(303) 555-0789",
    websiteStatus: "outdated",
    score: 78,
    status: "new",
  },
  {
    id: "4",
    businessName: "Green Thumb Landscaping",
    category: "Landscaping",
    city: "Seattle",
    state: "WA",
    email: "info@greenthumb.com",
    phone: "(206) 555-0321",
    websiteStatus: "none",
    score: 95,
    status: "responded",
  },
  {
    id: "5",
    businessName: "Family Dental Care",
    category: "Dentist",
    city: "Miami",
    state: "FL",
    email: "contact@familydental.com",
    phone: "(305) 555-0654",
    websiteStatus: "none",
    score: 88,
    status: "converted",
  },
];

const statusVariants: Record<Lead["status"], "success" | "info" | "warning" | "muted" | "accent"> = {
  new: "info",
  contacted: "warning",
  responded: "accent",
  converted: "success",
  unsubscribed: "muted",
};

const websiteStatusLabels: Record<Lead["websiteStatus"], string> = {
  none: "No Website",
  broken: "Broken",
  outdated: "Outdated",
};

export function LeadsTable() {
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
          {mockLeads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>
                <Checkbox />
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium text-foreground">{lead.businessName}</p>
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
                  variant={lead.websiteStatus === "none" ? "destructive" : "warning"}
                  className="font-normal"
                >
                  {websiteStatusLabels[lead.websiteStatus]}
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
                      style={{ width: `${lead.score}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground">{lead.score}</span>
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
                    <DropdownMenuItem>Mark as Contacted</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Remove Lead</DropdownMenuItem>
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
