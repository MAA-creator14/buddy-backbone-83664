import { useParams, useNavigate } from "react-router-dom";
import { useContact, useUpdateContact } from "@/hooks/useContacts";
import { useInteractions } from "@/hooks/useInteractions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { InteractionForm } from "@/components/interactions/InteractionForm";
import { InteractionFeed } from "@/components/interactions/InteractionFeed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ContactForm } from "@/components/contacts/ContactForm";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

// Helper function to calculate contact due status
const getContactDueStatus = (contact: any, interactions: any[]): 'overdue' | 'due-soon' | 'on-track' | 'no-frequency' => {
  if (!contact.engagement_frequency) return 'no-frequency';
  
  const contactInteractions = interactions.filter(i => i.contact_id === contact.id);
  const lastInteraction = contactInteractions[0];
  if (!lastInteraction) return 'overdue';

  const now = new Date();
  const lastDate = new Date(lastInteraction.date);
  const daysSinceContact = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  const frequencyDays: Record<string, number> = {
    weekly: 7,
    biweekly: 14,
    monthly: 30,
    quarterly: 90,
    biannually: 180,
    annually: 365
  };

  const targetDays = frequencyDays[contact.engagement_frequency];
  if (!targetDays) return 'no-frequency';

  if (daysSinceContact > targetDays) return 'overdue';
  if (daysSinceContact > targetDays * 0.8) return 'due-soon';
  return 'on-track';
};

const ContactDetail = () => {
  const { user, loading: authLoading } = useAuth(true);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: contact, isLoading: contactLoading } = useContact(id || "");
  const { data: interactions = [], isLoading: interactionsLoading } = useInteractions(id || "");
  const updateContactMutation = useUpdateContact();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const dueStatus = contact ? getContactDueStatus(contact, interactions) : 'no-frequency';

  const getDueStatusBadge = () => {
    if (dueStatus === 'no-frequency') return null;
    
    const statusConfig = {
      'overdue': { label: 'Overdue', variant: 'destructive' as const, icon: AlertCircle },
      'due-soon': { label: 'Due Soon', variant: 'default' as const, icon: Clock },
      'on-track': { label: 'On Track', variant: 'secondary' as const, icon: CheckCircle2 },
    };
    
    const config = statusConfig[dueStatus];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="text-xs">
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const handleEditContact = (data: any) => {
    if (contact && user) {
      updateContactMutation.mutate({ 
        id: contact.id, 
        ...data,
        user_id: user.id 
      });
      setIsEditDialogOpen(false);
    }
  };

  if (authLoading || contactLoading || interactionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Contact not found</h1>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{contact.name}</CardTitle>
                <p className="text-muted-foreground">
                  {contact.role} at {contact.company}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="capitalize">
                    {contact.relationship_type}
                  </Badge>
                  {getDueStatusBadge()}
                </div>
              </div>
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Contact</DialogTitle>
                  </DialogHeader>
                  <ContactForm
                    onSubmit={handleEditContact}
                    onCancel={() => setIsEditDialogOpen(false)}
                    defaultValues={{
                      name: contact.name,
                      email: contact.email || "",
                      company: contact.company || "",
                      role: contact.role || "",
                      relationshipType: contact.relationship_type as any,
                      linkedinProfile: contact.linkedin_url || "",
                      notes: contact.notes || "",
                      linkedInAutoSync: contact.linkedin_auto_sync || false,
                      engagementFrequency: contact.engagement_frequency as any,
                    }}
                    submitLabel="Save Changes"
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {contact.engagement_frequency && (
                <p className="text-sm">
                  <span className="font-medium">Engagement Frequency:</span>{" "}
                  <span className="capitalize">{contact.engagement_frequency}</span>
                </p>
              )}
              {contact.email && (
                <p className="text-sm">
                  <span className="font-medium">Email:</span> {contact.email}
                </p>
              )}
              {contact.linkedin_url && (
                <p className="text-sm">
                  <span className="font-medium">LinkedIn:</span>{" "}
                  <a
                    href={contact.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View Profile
                  </a>
                </p>
              )}
              {contact.notes && (
                <p className="text-sm">
                  <span className="font-medium">Notes:</span> {contact.notes}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <InteractionForm contactId={contact.id} />
          <InteractionFeed interactions={interactions} contactId={contact.id} />
        </div>
      </div>
    </div>
  );
};

export default ContactDetail;
