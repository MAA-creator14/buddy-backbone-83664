import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
// Form types are defined locally

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Must be a valid email").optional().or(z.literal("")),
  company: z.string().min(1, "Company is required").max(100),
  role: z.string().min(1, "Role is required").max(100),
  relationshipType: z.enum(["peer", "mentor", "client"] as const),
  linkedinProfile: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  notes: z.string().max(500).optional(),
  linkedInAutoSync: z.boolean().optional(),
  engagementFrequency: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly', 'biannually', 'annually']).optional().nullable(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactFormProps {
  onSubmit: (data: ContactFormValues) => void;
  onCancel?: () => void;
  defaultValues?: Partial<ContactFormValues>;
  submitLabel?: string;
}

export const ContactForm = ({ 
  onSubmit, 
  onCancel, 
  defaultValues,
  submitLabel = "Add Contact" 
}: ContactFormProps) => {
  const { toast } = useToast();
  const [isFetchingLinkedIn, setIsFetchingLinkedIn] = useState(false);
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: defaultValues || {
      name: "",
      email: "",
      company: "",
      role: "",
      relationshipType: "peer",
      linkedinProfile: "",
      notes: "",
      linkedInAutoSync: false,
      engagementFrequency: null,
    },
  });

  // Watch the LinkedIn profile field to enable/disable the fetch button
  const linkedinProfileValue = form.watch("linkedinProfile");

  const handleFetchLinkedInProfile = async () => {
    const linkedinUrl = form.getValues("linkedinProfile");
    
    if (!linkedinUrl) {
      toast({
        title: "LinkedIn URL Required",
        description: "Please enter a LinkedIn profile URL first",
        variant: "destructive",
      });
      return;
    }

    setIsFetchingLinkedIn(true);

    try {
      const { data, error } = await supabase.functions.invoke('fetch-linkedin-profile', {
        body: { linkedinUrl }
      });

      if (error) throw error;

      if (data && !data.error) {
        // Populate form fields with fetched data
        if (data.name) form.setValue("name", data.name);
        if (data.company) form.setValue("company", data.company);
        if (data.role) form.setValue("role", data.role);
        if (data.linkedinUrl) form.setValue("linkedinProfile", data.linkedinUrl);
        
        // Optionally add bio to notes if not already filled
        if (data.bio && !form.getValues("notes")) {
          form.setValue("notes", data.bio.substring(0, 500)); // Limit to 500 chars
        }

        toast({
          title: "Profile Fetched",
          description: "LinkedIn profile data has been loaded into the form",
        });
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error fetching LinkedIn profile:', error);
      toast({
        title: "Failed to Fetch Profile",
        description: error.message || "Could not retrieve LinkedIn profile data",
        variant: "destructive",
      });
    } finally {
      setIsFetchingLinkedIn(false);
    }
  };

  const handleSubmit = (data: ContactFormValues) => {
    // Map form field names to database column names
    const mappedData = {
      name: data.name,
      email: data.email || undefined,
      company: data.company,
      role: data.role,
      relationship_type: data.relationshipType,
      linkedin_url: data.linkedinProfile || undefined,
      notes: data.notes || undefined,
      linkedin_auto_sync: data.linkedInAutoSync || false,
      engagement_frequency: data.engagementFrequency || undefined,
    };
    onSubmit(mappedData);
    if (!defaultValues) {
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Inc" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Input placeholder="Product Manager" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="relationshipType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Relationship Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="peer">Peer</SelectItem>
                  <SelectItem value="mentor">Mentor</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="engagementFrequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Engagement Frequency</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="biannually">Bi-annually</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                How often do you want to stay in touch with this contact?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Optional)</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="linkedinProfile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LinkedIn Profile (Optional)</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input placeholder="https://linkedin.com/in/username" {...field} />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFetchLinkedInProfile}
                  disabled={isFetchingLinkedIn || !linkedinProfileValue || linkedinProfileValue.trim() === ""}
                >
                  {isFetchingLinkedIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    "Fetch Profile"
                  )}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="linkedInAutoSync"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Auto-sync LinkedIn interactions
                </FormLabel>
                <FormDescription>
                  Automatically detect and suggest LinkedIn interactions for this contact
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={!form.watch("linkedinProfile")}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add context about your relationship..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-2">
          <Button type="submit" className="flex-1">
            {submitLabel}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};
