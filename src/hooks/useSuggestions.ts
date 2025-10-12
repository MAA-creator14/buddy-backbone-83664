import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface InteractionSuggestion {
  id: string;
  contact_id: string;
  type: string;
  date: string;
  notes?: string;
  created_at: string;
}

export const useSuggestions = () => {
  return useQuery({
    queryKey: ["suggestions"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("interaction_suggestions")
        .select("*")
        .order("date", { ascending: true});

      if (error) throw error;
      return (data || []) as InteractionSuggestion[];
    },
  });
};

export const useAcceptSuggestion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (suggestion: InteractionSuggestion) => {
      // Create interaction from suggestion
      const { error: interactionError } = await (supabase as any)
        .from("interactions")
        .insert({
          contact_id: suggestion.contact_id,
          type: suggestion.type,
          date: suggestion.date,
          notes: suggestion.notes,
        });

      if (interactionError) throw interactionError;

      // Delete the suggestion
      const { error: deleteError } = await (supabase as any)
        .from("interaction_suggestions")
        .delete()
        .eq("id", suggestion.id);

      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["interactions"] });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast({
        title: "Success",
        description: "Suggestion accepted",
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

export const useRejectSuggestion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("interaction_suggestions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suggestions"] });
      toast({
        title: "Success",
        description: "Suggestion rejected",
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
