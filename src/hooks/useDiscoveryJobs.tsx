import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface DiscoveryJob {
  id: string;
  user_id: string;
  location: string;
  categories: string[];
  status: string;
  leads_found: number | null;
  leads_saved: number | null;
  last_run_at: string | null;
  next_run_at: string | null;
  is_recurring: boolean | null;
  created_at: string;
}

export const useDiscoveryJobs = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ["discovery_jobs", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("discovery_jobs")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as DiscoveryJob[];
    },
    enabled: !!user,
  });

  const createJob = useMutation({
    mutationFn: async (job: { 
      location: string; 
      categories: string[]; 
      is_recurring?: boolean;
    }) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("discovery_jobs")
        .insert({
          user_id: user.id,
          location: job.location,
          categories: job.categories,
          is_recurring: job.is_recurring || false,
          status: "pending",
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discovery_jobs"] });
      toast({ title: "Discovery job scheduled" });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to schedule job", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const runJob = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('scheduled-discovery');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["discovery_jobs"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({ 
        title: "Discovery completed", 
        description: `Found ${data.totalLeadsSaved || 0} new leads` 
      });
    },
    onError: (error) => {
      toast({ 
        title: "Discovery failed", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const deleteJob = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("discovery_jobs")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discovery_jobs"] });
      toast({ title: "Job deleted" });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to delete job", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  return {
    jobs,
    isLoading,
    error,
    createJob,
    runJob,
    deleteJob,
  };
};
