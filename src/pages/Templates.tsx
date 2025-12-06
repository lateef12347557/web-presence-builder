import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Search, 
  FileText, 
  Copy, 
  Edit, 
  Trash2, 
  MoreVertical,
  Mail,
  Star,
  Eye,
  Loader2,
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTemplates } from "@/hooks/useTemplates";
import { toast } from "sonner";

const categoryOptions = ["Restaurants", "Retail", "Services", "Automotive", "Healthcare", "General"];

// Default outreach template
const DEFAULT_TEMPLATE = {
  name: "Website Services Introduction",
  category: "General",
  subject: "Grow Your Business with a Professional Website",
  content: `Hi {{business_name}},

I noticed your business online and saw you don't yet have a website.
I help businesses like yours get professional websites that bring customers.

Would you like me to set one up for you?

Best regards`,
};

export default function Templates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    subject: "",
    content: "",
  });

  const { templates, isLoading, createTemplate, updateTemplate, deleteTemplate } = useTemplates();

  const categories = ["All", ...categoryOptions];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenCreate = (useDefault = false) => {
    if (useDefault) {
      setFormData(DEFAULT_TEMPLATE);
    } else {
      setFormData({ name: "", category: "", subject: "", content: "" });
    }
    setEditingTemplate(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (template: any) => {
    setFormData({
      name: template.name,
      category: template.category,
      subject: template.subject,
      content: template.content,
    });
    setEditingTemplate(template);
    setIsCreateOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.category || !formData.subject || !formData.content) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      if (editingTemplate) {
        await updateTemplate.mutateAsync({
          id: editingTemplate.id,
          ...formData,
        });
      } else {
        await createTemplate.mutateAsync(formData);
      }
      setIsCreateOpen(false);
      setFormData({ name: "", category: "", subject: "", content: "" });
      setEditingTemplate(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDuplicate = async (template: any) => {
    await createTemplate.mutateAsync({
      name: `${template.name} (Copy)`,
      category: template.category,
      subject: template.subject,
      content: template.content,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Email Templates</h1>
            <p className="text-muted-foreground">Create and manage your outreach email templates</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleOpenCreate(true)}>
              <FileText className="w-4 h-4 mr-2" />
              Use Default
            </Button>
            <Button onClick={() => handleOpenCreate(false)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Edit Template" : "Create New Template"}
              </DialogTitle>
              <DialogDescription>
                {editingTemplate 
                  ? "Update your email template."
                  : "Create a new email template for your outreach campaigns."
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., Restaurant Introduction"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input 
                  id="subject" 
                  placeholder="e.g., Grow Your Business Online"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Email Body</Label>
                <Textarea 
                  id="body" 
                  placeholder="Write your email content here..."
                  className="min-h-[200px]"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Available variables:</strong> {"{{business_name}}"}, {"{{category}}"}, {"{{city}}"}, {"{{state}}"}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={createTemplate.isPending || updateTemplate.isPending}
              >
                {(createTemplate.isPending || updateTemplate.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingTemplate ? "Save Changes" : "Create Template"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search templates..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <Card key={template.id} variant="interactive" className="group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEdit(template)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => deleteTemplate.mutate(template.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-base mt-3">{template.name}</CardTitle>
                  <CardDescription className="line-clamp-1">{template.subject}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{template.category}</Badge>
                    {template.is_active && <Badge variant="success">Active</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.content}
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-foreground">{template.usage_count}</p>
                      <p className="text-xs text-muted-foreground">Uses</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-foreground">
                        {template.response_rate ? `${template.response_rate}%` : "-"}
                      </p>
                      <p className="text-xs text-muted-foreground">Response</p>
                    </div>
                    <div className="text-center">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleOpenEdit(template)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredTemplates.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No templates found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedCategory !== "All" 
                  ? "Try adjusting your search or filters"
                  : "Create your first email template to get started"}
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => handleOpenCreate(true)}>
                  <FileText className="w-4 h-4 mr-2" />
                  Use Default Template
                </Button>
                <Button onClick={() => handleOpenCreate(false)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Custom
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
