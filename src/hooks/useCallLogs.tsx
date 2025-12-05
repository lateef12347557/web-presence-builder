import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import type { Database } from "@/integrations/supabase/types";

type CallLog = Database["public"]["Tables"]["call_logs"]["Row"];
type CallLogInsert = Database["public"]["Tables"]["call_logs"]["Insert"];

export const useCallLogs = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: callLogs = [], isLoading, error } = useQuery({
    queryKey: ["call_logs", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("call_logs")
        .select("*, leads(business_name, phone)")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createCallLog = useMutation({
    mutationFn: async (callLog: Omit<CallLogInsert, "user_id">) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("call_logs")
        .insert({ ...callLog, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["call_logs"] });
      toast({ title: "Call logged successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to log call", description: error.message, variant: "destructive" });
    },
  });

  return {
    callLogs,
    isLoading,
    error,
    createCallLog,
  };
};
