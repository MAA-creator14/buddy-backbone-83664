import { useParams, useNavigate } from "react-router-dom";
import { useContactStore, getContactDueStatus } from "@/store/contactStore";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { InteractionForm } from "@/components/interactions/InteractionForm";
import { InteractionFeed } from "@/components/interactions/InteractionFeed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ContactForm } from "@/components/contacts/ContactForm";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const ContactDetail = () => {
  const { loading } = useAuth(true);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { contacts, getInteractionsByContact, updateContact, interactions: allInteractions } = useContactStore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const contact = contacts.find((c) => c.id === id);
  const interactions = contact ? getInteractionsByContact(contact.id) : [];
  const dueStatus = contact ? getContactDueStatus(contact, allInteractions) : 'no-frequency';

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
    if (contact) {
      updateContact(contact.id, data);
      setIsEditDialogOpen(false);
      toast.success("Contact updated successfully");
    }
  };

  if (loading) {
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
                    {contact.relationshipType}
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
                      company: contact.company,
                      role: contact.role,
                      relationshipType: contact.relationshipType,
                      linkedinProfile: contact.linkedinProfile || "",
                      notes: contact.notes || "",
                      linkedInAutoSync: contact.linkedInAutoSync || false,
                      engagementFrequency: contact.engagementFrequency || null,
                    }}
                    submitLabel="Save Changes"
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {contact.engagementFrequency && (
                <p className="text-sm">
                  <span className="font-medium">Engagement Frequency:</span>{" "}
                  <span className="capitalize">{contact.engagementFrequency}</span>
                </p>
              )}
              {contact.email && (
                <p className="text-sm">
                  <span className="font-medium">Email:</span> {contact.email}
                </p>
              )}
              {contact.linkedinProfile && (
                <p className="text-sm">
                  <span className="font-medium">LinkedIn:</span>{" "}
                  <a
                    href={contact.linkedinProfile}
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
          <InteractionFeed interactions={interactions} />
        </div>
      </div>
    </div>
  );
};

export default ContactDetail;
