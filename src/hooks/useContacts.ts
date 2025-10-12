import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Contact {
  id: string;
  name: string;
  email?: string;
  company?: string;
  role?: string;
  relationship_type?: string;
  linkedin_url?: string;
  notes?: string;
  linkedin_auto_sync?: boolean;
  engagement_frequency?: string;
  last_contacted?: string;
  linkedin_sync_status?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useContacts = () => {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Contact[];
    },
  });
};

export const useContact = (id: string) => {
  return useQuery({
    queryKey: ["contacts", id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("contacts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Contact;
    },
    enabled: !!id,
  });
};

export const useAddContact = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (contact: Omit<Contact, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await (supabase as any)
        .from("contacts")
        .insert(contact)
        .select()
        .single();

      if (error) throw error;
      return data as Contact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast({
        title: "Success",
        description: "Contact added successfully",
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

export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Contact> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from("contacts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Contact;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["contacts", data.id] });
      }
      toast({
        title: "Success",
        description: "Contact updated successfully",
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

export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("contacts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast({
        title: "Success",
        description: "Contact deleted successfully",
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
