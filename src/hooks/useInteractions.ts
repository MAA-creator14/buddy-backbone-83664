import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Interaction {
  id: string;
  contact_id: string;
  type: string;
  date: string;
  notes?: string;
  created_at: string;
}

export const useInteractions = (contactId?: string) => {
  return useQuery({
    queryKey: contactId ? ["interactions", contactId] : ["interactions"],
    queryFn: async () => {
      let query = (supabase as any)
        .from("interactions")
        .select("*");
      
      if (contactId) {
        query = query.eq("contact_id", contactId);
      }
      
      const { data, error } = await query.order("date", { ascending: false });

      if (error) throw error;
      return (data || []) as Interaction[];
    },
  });
};

export const useAddInteraction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (interaction: Omit<Interaction, "id" | "created_at">) => {
      const { data, error } = await (supabase as any)
        .from("interactions")
        .insert(interaction)
        .select()
        .single();

      if (error) throw error;
      return data as Interaction;
    },
    onSuccess: (data) => {
      if (data?.contact_id) {
        queryClient.invalidateQueries({ queryKey: ["interactions", data.contact_id] });
      }
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast({
        title: "Success",
        description: "Interaction logged successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });
};

export const useDeleteInteraction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, contactId }: { id: string; contactId: string }) => {
      const { error } = await (supabase as any)
        .from("interactions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return contactId;
    },
    onSuccess: (contactId) => {
      queryClient.invalidateQueries({ queryKey: ["interactions", contactId] });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast({
        title: "Success",
        description: "Interaction deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });
};
