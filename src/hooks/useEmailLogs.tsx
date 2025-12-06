import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface EmailLog {
  id: string;
  user_id: string;
  lead_id: string | null;
  campaign_id: string | null;
  template_id: string | null;
  to_email: string;
  subject: string;
  status: string;
  opened_at: string | null;
  clicked_at: string | null;
  replied_at: string | null;
  bounced_at: string | null;
  created_at: string;
}

export const useEmailLogs = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: emailLogs = [], isLoading, error } = useQuery({
    queryKey: ["email_logs", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("email_logs")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as EmailLog[];
    },
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ["email_stats", user?.id],
    queryFn: async () => {
      if (!user) return { sent: 0, opened: 0, clicked: 0, replied: 0, bounced: 0 };
      
      const { data, error } = await supabase
        .from("email_logs")
        .select("status, opened_at, clicked_at, replied_at, bounced_at");
      
      if (error) throw error;
      
      const logs = data || [];
      return {
        sent: logs.length,
        opened: logs.filter(l => l.opened_at).length,
        clicked: logs.filter(l => l.clicked_at).length,
        replied: logs.filter(l => l.replied_at).length,
        bounced: logs.filter(l => l.bounced_at).length,
      };
    },
    enabled: !!user,
  });

  const sendEmail = useMutation({
    mutationFn: async ({ leadId, templateId, campaignId }: { 
      leadId: string; 
      templateId?: string;
      campaignId?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase.functions.invoke('send-campaign-email', {
        body: {
          lead_id: leadId,
          template_id: templateId,
          campaign_id: campaignId,
          user_id: user.id,
        },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email_logs"] });
      queryClient.invalidateQueries({ queryKey: ["email_stats"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: "Email sent successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to send email", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  return {
    emailLogs,
    stats: stats || { sent: 0, opened: 0, clicked: 0, replied: 0, bounced: 0 },
    isLoading,
    error,
    sendEmail,
  };
};
