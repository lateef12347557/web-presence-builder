import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Phone, 
  Search, 
  PhoneCall, 
  PhoneOff, 
  PhoneMissed,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  Building2,
  MapPin,
  MessageSquare,
  Filter,
  Download
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const callQueue = [
  {
    id: 1,
    businessName: "Tony's Pizza Palace",
    phone: "(555) 123-4567",
    category: "Restaurant",
    location: "Brooklyn, NY",
    lastContact: null,
    status: "pending",
    priority: "high",
  },
  {
    id: 2,
    businessName: "Green Thumb Landscaping",
    phone: "(555) 234-5678",
    category: "Services",
    location: "Austin, TX",
    lastContact: "2024-01-10",
    status: "callback",
    priority: "medium",
  },
  {
    id: 3,
    businessName: "Mike's Auto Repair",
    phone: "(555) 345-6789",
    category: "Automotive",
    location: "Chicago, IL",
    lastContact: "2024-01-08",
    status: "no_answer",
    priority: "low",
  },
  {
    id: 4,
    businessName: "Bella Salon & Spa",
    phone: "(555) 456-7890",
    category: "Beauty",
    location: "Miami, FL",
    lastContact: null,
    status: "pending",
    priority: "high",
  },
  {
    id: 5,
    businessName: "Downtown Dental",
    phone: "(555) 567-8901",
    category: "Healthcare",
    location: "Denver, CO",
    lastContact: "2024-01-12",
    status: "interested",
    priority: "high",
  },
];

const callHistory = [
  {
    id: 1,
    businessName: "Joe's Plumbing",
    phone: "(555) 111-2222",
    duration: "4:32",
    outcome: "interested",
    date: "2024-01-15 10:30 AM",
    notes: "Interested in a basic website. Will send proposal.",
  },
  {
    id: 2,
    businessName: "Sarah's Bakery",
    phone: "(555) 222-3333",
    duration: "2:15",
    outcome: "callback",
    date: "2024-01-15 09:45 AM",
    notes: "Asked to call back next week. Owner on vacation.",
  },
  {
    id: 3,
    businessName: "Elite Fitness",
    phone: "(555) 333-4444",
    duration: "0:45",
    outcome: "not_interested",
    date: "2024-01-14 03:20 PM",
    notes: "Already working with another agency.",
  },
  {
    id: 4,
    businessName: "Corner Cafe",
    phone: "(555) 444-5555",
    duration: "6:10",
    outcome: "interested",
    date: "2024-01-14 11:00 AM",
    notes: "Very interested. Scheduled meeting for next Tuesday.",
  },
];

const stats = [
  { label: "Calls Today", value: "24", icon: PhoneCall, trend: "+8" },
  { label: "Connected", value: "18", icon: CheckCircle2, trend: "75%" },
  { label: "Interested", value: "5", icon: User, trend: "28%" },
  { label: "Callbacks", value: "7", icon: Clock, trend: null },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge variant="secondary">Pending</Badge>;
    case "callback":
      return <Badge variant="warning">Callback</Badge>;
    case "no_answer":
      return <Badge variant="muted">No Answer</Badge>;
    case "interested":
      return <Badge variant="success">Interested</Badge>;
    case "not_interested":
      return <Badge variant="destructive">Not Interested</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "high":
      return <Badge variant="destructive">High</Badge>;
    case "medium":
      return <Badge variant="warning">Medium</Badge>;
    case "low":
      return <Badge variant="secondary">Low</Badge>;
    default:
      return <Badge>{priority}</Badge>;
  }
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

export default function PhoneOutreach() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLogCallOpen, setIsLogCallOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<typeof callQueue[0] | null>(null);

  const filteredQueue = callQueue.filter(lead => {
    const matchesSearch = lead.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCall = (lead: typeof callQueue[0]) => {
    setSelectedLead(lead);
    setIsLogCallOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Phone Outreach</h1>
            <p className="text-muted-foreground">Manage calls and track phone outreach activities</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    {stat.trend && (
                      <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Call Queue */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Call Queue</CardTitle>
                    <CardDescription>Leads ready for phone outreach</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search..." 
                        className="pl-10 w-[200px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[130px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="callback">Callback</SelectItem>
                        <SelectItem value="no_answer">No Answer</SelectItem>
                        <SelectItem value="interested">Interested</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQueue.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{lead.businessName}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {lead.location}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{lead.phone}</TableCell>
                        <TableCell>{getStatusBadge(lead.status)}</TableCell>
                        <TableCell>{getPriorityBadge(lead.priority)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            className="gap-2"
                            onClick={() => handleCall(lead)}
                          >
                            <PhoneCall className="w-4 h-4" />
                            Call
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Call History */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Calls</CardTitle>
                <CardDescription>Your latest call activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {callHistory.map((call) => (
                  <div key={call.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="mt-1">{getOutcomeIcon(call.outcome)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{call.businessName}</p>
                      <p className="text-xs text-muted-foreground">{call.date}</p>
                      <p className="text-xs text-muted-foreground mt-1">Duration: {call.duration}</p>
                      {call.notes && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{call.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* TCPA Compliance Notice */}
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">TCPA Compliance Reminder</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Phone numbers are displayed for manual calling only. SMS outreach requires explicit opt-in consent. 
                  Always identify yourself and your business when making calls. Respect "Do Not Call" requests immediately.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Log Call Dialog */}
      <Dialog open={isLogCallOpen} onOpenChange={setIsLogCallOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Call</DialogTitle>
            <DialogDescription>
              {selectedLead && (
                <span>Record the outcome of your call to {selectedLead.businessName}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedLead && (
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{selectedLead.businessName}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono text-sm">{selectedLead.phone}</span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Call Outcome</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="callback">Callback Requested</SelectItem>
                  <SelectItem value="not_interested">Not Interested</SelectItem>
                  <SelectItem value="no_answer">No Answer</SelectItem>
                  <SelectItem value="wrong_number">Wrong Number</SelectItem>
                  <SelectItem value="voicemail">Left Voicemail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Call Duration</Label>
              <Input placeholder="e.g., 5:30" />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea placeholder="Add any relevant notes about the call..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogCallOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsLogCallOpen(false)}>Save Call Log</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
