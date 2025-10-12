import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContactStore, Contact } from "@/store/contactStore";
import { ContactForm } from "@/components/contacts/ContactForm";
import { ContactCard } from "@/components/contacts/ContactCard";
import { ProgressIndicator } from "@/components/contacts/ProgressIndicator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const MIN_CONTACTS = 5;
const MAX_CONTACTS = 10;

export default function Onboarding() {
  const { loading } = useAuth(true);
  const navigate = useNavigate();
  const { contacts, addContact, updateContact, deleteContact } = useContactStore();
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const isPreview = typeof window !== 'undefined' && window.location.search.includes('__lovable_token');

  const canProceed = contacts.length >= MIN_CONTACTS;
  const reachedMax = contacts.length >= MAX_CONTACTS;

  const handleAddContact = (data: any) => {
    addContact(data);
  };

  const handleEditContact = (data: any) => {
    if (editingContact) {
      updateContact(editingContact.id, data);
      setIsEditDialogOpen(false);
      setEditingContact(null);
    }
  };

  const handleEditClick = (contact: Contact) => {
    setEditingContact(contact);
    setIsEditDialogOpen(true);
  };

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    setEditingContact(null);
  };

  const handleContinue = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-6 animate-fade-in-up">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                <span className="bg-gradient-text bg-clip-text text-transparent">
                  Build Your Network
                </span>
              </h1>
              <div className="h-1 w-24 mx-auto bg-gradient-primary rounded-full" />
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
              Add your most trusted professional contacts to get started
            </p>
            <p className="text-sm text-muted-foreground/80 max-w-xl mx-auto">
              You need at least <span className="font-semibold text-primary">{MIN_CONTACTS} contacts</span> to continue
            </p>
          </div>

          {/* Progress */}
          <ProgressIndicator 
            current={contacts.length}
            minimum={MIN_CONTACTS}
            maximum={MAX_CONTACTS}
          />

          <div className="grid md:grid-cols-2 gap-8">
            {/* Add Contact Form */}
            <Card className="p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                  {reachedMax ? "Maximum Reached" : "Add New Contact"}
                </h2>
                {reachedMax ? (
                  <p className="text-sm text-muted-foreground">
                    You've added the maximum of {MAX_CONTACTS} contacts during onboarding.
                    You can add more contacts after accessing the dashboard.
                  </p>
                ) : (
                  <ContactForm onSubmit={handleAddContact} submitLabel="Add Contact" />
                )}
              </div>
            </Card>

            {/* Contact List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Your Contacts ({contacts.length})
                </h2>
              </div>
              
              {contacts.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No contacts added yet. Start by adding your first contact.
                  </p>
                </Card>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {contacts.map((contact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      onEdit={handleEditClick}
                      onDelete={deleteContact}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Continue Button */}
          {canProceed && (
            <div className="flex justify-center pt-4">
              <Button 
                size="lg" 
                onClick={handleContinue}
                className="min-w-[200px] gap-2"
              >
                Continue to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {isPreview && (
          <div className="fixed bottom-4 right-4 z-40">
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              Open Dashboard (Preview)
            </Button>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>
              Update the details for this contact.
            </DialogDescription>
          </DialogHeader>
          {editingContact && (
            <ContactForm
              onSubmit={handleEditContact}
              onCancel={handleCancelEdit}
              submitLabel="Save Changes"
              defaultValues={{
                name: editingContact.name,
                email: editingContact.email || "",
                company: editingContact.company,
                role: editingContact.role,
                relationshipType: editingContact.relationshipType,
                linkedinProfile: editingContact.linkedinProfile || "",
                notes: editingContact.notes || "",
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
