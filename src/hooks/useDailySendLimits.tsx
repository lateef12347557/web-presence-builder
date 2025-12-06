import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface DailySendLimit {
  id: string;
  user_id: string;
  daily_limit: number;
  sent_today: number;
  last_reset_date: string;
  created_at: string;
}

export const useDailySendLimits = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: limits, isLoading, error } = useQuery({
    queryKey: ["daily_send_limits", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("daily_send_limits")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      
      // Return default if no record exists
      if (!data) {
        return {
          id: "",
          user_id: user.id,
          daily_limit: 100,
          sent_today: 0,
          last_reset_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
        };
      }
      
      return data as DailySendLimit;
    },
    enabled: !!user,
  });

  const updateLimit = useMutation({
    mutationFn: async (newLimit: number) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("daily_send_limits")
        .upsert({
          user_id: user.id,
          daily_limit: newLimit,
        }, { onConflict: "user_id" })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily_send_limits"] });
      toast({ title: "Daily limit updated" });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to update limit", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const remaining = limits ? Math.max(0, limits.daily_limit - limits.sent_today) : 100;

  return {
    limits,
    remaining,
    isLoading,
    error,
    updateLimit,
  };
};
