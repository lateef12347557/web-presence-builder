import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface EmailSequence {
  id: string;
  user_id: string;
  lead_id: string;
  campaign_id: string | null;
  sequence_step: number;
  scheduled_at: string;
  sent_at: string | null;
  status: string;
  template_type: string;
  created_at: string;
}

export const useEmailSequences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sequences = [], isLoading, error } = useQuery({
    queryKey: ["email-sequences", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("email_sequences")
        .select("*")
        .order("scheduled_at", { ascending: true });
      
      if (error) throw error;
      return data as EmailSequence[];
    },
    enabled: !!user,
  });

  const createSequence = useMutation({
    mutationFn: async (leadIds: string[], campaignId?: string) => {
      if (!user) throw new Error("Not authenticated");
      
      const now = new Date();
      const sequences: Omit<EmailSequence, 'id' | 'created_at' | 'sent_at'>[] = [];
      
      for (const leadId of leadIds) {
        // First contact - immediate
        sequences.push({
          user_id: user.id,
          lead_id: leadId,
          campaign_id: campaignId || null,
          sequence_step: 1,
          scheduled_at: now.toISOString(),
          status: "pending",
          template_type: "first_contact",
        });
        
        // Follow-up 1 - 48 hours later
        const followup1 = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        sequences.push({
          user_id: user.id,
          lead_id: leadId,
          campaign_id: campaignId || null,
          sequence_step: 2,
          scheduled_at: followup1.toISOString(),
          status: "pending",
          template_type: "followup_1",
        });
        
        // Follow-up 2 - 96 hours (4 days) later
        const followup2 = new Date(now.getTime() + 96 * 60 * 60 * 1000);
        sequences.push({
          user_id: user.id,
          lead_id: leadId,
          campaign_id: campaignId || null,
          sequence_step: 3,
          scheduled_at: followup2.toISOString(),
          status: "pending",
          template_type: "followup_2",
        });
        
        // Final close - 7 days later
        const finalClose = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        sequences.push({
          user_id: user.id,
          lead_id: leadId,
          campaign_id: campaignId || null,
          sequence_step: 4,
          scheduled_at: finalClose.toISOString(),
          status: "pending",
          template_type: "final_close",
        });
      }
      
      const { data, error } = await supabase
        .from("email_sequences")
        .insert(sequences)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["email-sequences"] });
      toast({ 
        title: "Email sequence created", 
        description: `${data.length} emails scheduled across ${data.length / 4} leads` 
      });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to create sequence", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const cancelSequence = useMutation({
    mutationFn: async (leadId: string) => {
      const { error } = await supabase
        .from("email_sequences")
        .update({ status: "cancelled" })
        .eq("lead_id", leadId)
        .eq("status", "pending");
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-sequences"] });
      toast({ title: "Sequence cancelled" });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to cancel sequence", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  // Get sequence stats
  const pendingCount = sequences.filter(s => s.status === "pending").length;
  const sentCount = sequences.filter(s => s.status === "sent").length;
  const scheduledToday = sequences.filter(s => {
    const scheduledDate = new Date(s.scheduled_at).toDateString();
    const today = new Date().toDateString();
    return s.status === "pending" && scheduledDate === today;
  }).length;

  return {
    sequences,
    isLoading,
    error,
    createSequence,
    cancelSequence,
    stats: {
      pending: pendingCount,
      sent: sentCount,
      scheduledToday,
    },
  };
};
