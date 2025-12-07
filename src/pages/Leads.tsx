import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Download, 
  Mail,
  RefreshCw,
  Flame,
  Thermometer,
  Snowflake,
  PlayCircle
} from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { useEmailSequences } from "@/hooks/useEmailSequences";
import { useToast } from "@/hooks/use-toast";

const Leads = () => {
  const { leads, isLoading } = useLeads();
  const { createSequence, stats } = useEmailSequences();
  const { toast } = useToast();
  
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    state: "all",
    category: "all",
    websiteStatus: "all",
    leadStatus: "all",
    tier: "all",
  });

  // Calculate stats
  const leadStats = useMemo(() => {
    const total = leads.length;
    const withEmail = leads.filter(l => l.email).length;
    const noWebsite = leads.filter(l => l.website_status === "none").length;
    const hot = leads.filter(l => (l as any).lead_tier === "hot" || (l.score && l.score >= 70)).length;
    const warm = leads.filter(l => (l as any).lead_tier === "warm" || (l.score && l.score >= 40 && l.score < 70)).length;
    const cold = leads.filter(l => (l as any).lead_tier === "cold" || !l.score || l.score < 40).length;
    
    return { total, withEmail, noWebsite, hot, warm, cold };
  }, [leads]);

  // Get unique values for filters
  const uniqueStates = useMemo(() => 
    [...new Set(leads.map(l => l.state))].sort(),
    [leads]
  );
  
  const uniqueCategories = useMemo(() => 
    [...new Set(leads.map(l => l.category))].sort(),
    [leads]
  );

  const handleExportCSV = () => {
    const selectedData = leads.filter(l => 
      selectedLeads.length === 0 || selectedLeads.includes(l.id)
    );
    
    const csv = [
      ["Business Name", "Category", "City", "State", "Email", "Phone", "Website Status", "Score", "Status"].join(","),
      ...selectedData.map(l => [
        `"${l.business_name}"`,
        `"${l.category}"`,
        `"${l.city}"`,
        l.state,
        l.email || "",
        l.phone || "",
        l.website_status,
        l.score || 0,
        l.status
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Export complete", description: `Exported ${selectedData.length} leads` });
  };

  const handleStartSequence = () => {
    if (selectedLeads.length === 0) {
      toast({ 
        title: "No leads selected", 
        description: "Select leads to start an email sequence",
        variant: "destructive"
      });
      return;
    }
    
    // Filter to only leads with email
    const leadsWithEmail = leads
      .filter(l => selectedLeads.includes(l.id) && l.email)
      .map(l => l.id);
    
    if (leadsWithEmail.length === 0) {
      toast({ 
        title: "No valid leads", 
        description: "Selected leads don't have email addresses",
        variant: "destructive"
      });
      return;
    }
    
    createSequence.mutate(leadsWithEmail);
    setSelectedLeads([]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leads</h1>
            <p className="text-muted-foreground mt-1">
              Manage and filter your discovered business leads
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              variant="hero" 
              onClick={handleStartSequence}
              disabled={selectedLeads.length === 0 || createSequence.isPending}
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Start Sequence ({selectedLeads.length})
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search businesses..." 
                    className="pl-10"
                    value={filters.search}
                    onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                  />
                </div>
              </div>
              
              <Select 
                value={filters.state} 
                onValueChange={(v) => setFilters(f => ({ ...f, state: v }))}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {uniqueStates.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.category}
                onValueChange={(v) => setFilters(f => ({ ...f, category: v }))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.websiteStatus}
                onValueChange={(v) => setFilters(f => ({ ...f, websiteStatus: v }))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Website Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="none">No Website</SelectItem>
                  <SelectItem value="broken">Broken Website</SelectItem>
                  <SelectItem value="outdated">Outdated Website</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.tier}
                onValueChange={(v) => setFilters(f => ({ ...f, tier: v }))}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Lead Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="hot">🔥 Hot</SelectItem>
                  <SelectItem value="warm">🌡️ Warm</SelectItem>
                  <SelectItem value="cold">❄️ Cold</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.leadStatus}
                onValueChange={(v) => setFilters(f => ({ ...f, leadStatus: v }))}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Lead Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setFilters({
                  search: "",
                  state: "all",
                  category: "all",
                  websiteStatus: "all",
                  leadStatus: "all",
                  tier: "all",
                })}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="flex flex-wrap items-center gap-4">
          <Badge variant="info" className="text-sm py-1.5 px-3">
            {leadStats.total} total leads
          </Badge>
          <Badge variant="success" className="text-sm py-1.5 px-3">
            {leadStats.withEmail} with email
          </Badge>
          <Badge variant="warning" className="text-sm py-1.5 px-3">
            {leadStats.noWebsite} no website
          </Badge>
          <div className="flex items-center gap-2 ml-auto">
            <Badge variant="outline" className="text-sm py-1.5 px-3 gap-1 bg-destructive/10 text-destructive border-destructive/20">
              <Flame className="w-3 h-3" />
              {leadStats.hot} Hot
            </Badge>
            <Badge variant="outline" className="text-sm py-1.5 px-3 gap-1 bg-warning/10 text-warning border-warning/20">
              <Thermometer className="w-3 h-3" />
              {leadStats.warm} Warm
            </Badge>
            <Badge variant="outline" className="text-sm py-1.5 px-3 gap-1 bg-muted text-muted-foreground">
              <Snowflake className="w-3 h-3" />
              {leadStats.cold} Cold
            </Badge>
          </div>
        </div>

        {/* Sequence Stats */}
        {stats.pending > 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Email Sequences Active</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.pending} pending • {stats.scheduledToday} scheduled today • {stats.sent} sent
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leads Table */}
        <Card variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">All Leads</CardTitle>
            <div className="flex items-center gap-2">
              {selectedLeads.length > 0 && (
                <span className="text-sm text-primary font-medium">
                  {selectedLeads.length} selected
                </span>
              )}
              <span className="text-sm text-muted-foreground">
                Showing {leads.length} leads
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <LeadsTable 
              selectedLeads={selectedLeads}
              onSelectionChange={setSelectedLeads}
              filters={filters}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Leads;
