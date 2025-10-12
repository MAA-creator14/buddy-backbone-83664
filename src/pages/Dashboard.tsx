import { useState, useEffect } from "react";
import { useContactStore, Contact, getContactDueStatus } from "@/store/contactStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContactCard } from "@/components/contacts/ContactCard";
import { ContactForm } from "@/components/contacts/ContactForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, RefreshCw, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SuggestionsBanner } from "@/components/linkedin/SuggestionsBanner";
import { SuggestionsPanel } from "@/components/linkedin/SuggestionsPanel";
import { useLinkedInSync } from "@/hooks/useLinkedInSync";
import { DiagnosticsPanel } from "@/components/diagnostics/DiagnosticsPanel";
import { isSafeModeEnabled } from "@/lib/safeMode";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { loading, signOut } = useAuth(true);
  const { contacts, updateContact, deleteContact, addContact, getPendingSuggestions, interactions } = useContactStore();
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);
  const [isSuggestionsPanelOpen, setIsSuggestionsPanelOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'due' | 'recent'>('all');
  const navigate = useNavigate();
  const { syncLinkedInInteractions, isSyncing } = useLinkedInSync();
  
  const safeMode = isSafeModeEnabled();
  const pendingSuggestions = safeMode ? [] : getPendingSuggestions();

  // Calculate contact statuses and sort
  const contactsWithStatus = contacts.map(contact => ({
    contact,
    dueStatus: getContactDueStatus(contact, interactions)
  }));

  // Filter contacts
  const filteredContacts = contactsWithStatus.filter(({ dueStatus }) => {
    if (filterTab === 'all') return true;
    if (filterTab === 'due') return dueStatus === 'overdue' || dueStatus === 'due-soon';
    if (filterTab === 'recent') return dueStatus === 'on-track';
    return true;
  });

  // Sort by due status priority
  const sortedContacts = filteredContacts.sort((a, b) => {
    const statusPriority = { 'overdue': 0, 'due-soon': 1, 'on-track': 2, 'no-frequency': 3 };
    return statusPriority[a.dueStatus] - statusPriority[b.dueStatus];
  });

  // Count contacts by status
  const overdueCount = contactsWithStatus.filter(c => c.dueStatus === 'overdue').length;
  const dueSoonCount = contactsWithStatus.filter(c => c.dueStatus === 'due-soon').length;
  const onTrackCount = contactsWithStatus.filter(c => c.dueStatus === 'on-track').length;

  // Auto-sync on mount and every 15 minutes (disabled in safe mode)
  useEffect(() => {
    if (safeMode) {
      console.log('🛡️ Safe mode enabled - LinkedIn sync disabled');
      return;
    }
    
    const hasAutoSyncContacts = contacts.some(c => c.linkedInAutoSync);
    if (!hasAutoSyncContacts) return;
    
    try {
      syncLinkedInInteractions();
      
      const interval = setInterval(() => {
        syncLinkedInInteractions();
      }, 15 * 60 * 1000);

      return () => clearInterval(interval);
    } catch (err) {
      console.error('LinkedIn sync error:', err);
    }
  }, [contacts.length, safeMode]);

  const handleEditContact = (data: any) => {
    if (editingContact) {
      updateContact(editingContact.id, data);
      setIsEditDialogOpen(false);
      setEditingContact(null);
      toast.success("Contact updated successfully");
    }
  };

  const handleEditClick = (contact: Contact) => {
    setEditingContact(contact);
    setIsEditDialogOpen(true);
  };

  const handleAddContact = (data: any) => {
    addContact(data);
    setIsAddDialogOpen(false);
    toast.success("Contact added successfully");
  };

  const handleDeleteClick = (id: string) => {
    setDeletingContactId(id);
  };

  const confirmDelete = () => {
    if (deletingContactId) {
      deleteContact(deletingContactId);
      setDeletingContactId(null);
      toast.success("Contact deleted successfully");
    }
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
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Your Network Dashboard
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage your {contacts.length} professional contacts
              </p>
            </div>
            <div className="flex gap-2">
              {!safeMode && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => syncLinkedInInteractions()}
                  disabled={isSyncing}
                >
                  <RefreshCw className={`mr-2 h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync LinkedIn'}
                </Button>
              )}
              <Button onClick={() => setIsAddDialogOpen(true)} size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Add Contact
              </Button>
              <Button onClick={signOut} variant="outline" size="lg">
                <LogOut className="mr-2 h-5 w-5" />
                Sign Out
              </Button>
            </div>
          </div>

          {!safeMode && (
            <SuggestionsBanner
              suggestionCount={pendingSuggestions.length}
              onViewSuggestions={() => setIsSuggestionsPanelOpen(true)}
            />
          )}

          {contacts.length === 0 ? (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <div className="text-muted-foreground">
                  <p className="text-lg font-medium">No contacts yet</p>
                  <p className="mt-2 text-sm">
                    Add your first contact to start building your professional network
                  </p>
                </div>
                <Button onClick={() => navigate("/onboarding")} variant="outline">
                  Go to Onboarding
                </Button>
              </div>
            </Card>
          ) : (
            <Tabs value={filterTab} onValueChange={(v) => setFilterTab(v as typeof filterTab)} className="space-y-6">
              <TabsList>
                <TabsTrigger value="all">
                  All Contacts
                  <Badge variant="secondary" className="ml-2">{contacts.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="due">
                  Due & Overdue
                  {(overdueCount + dueSoonCount) > 0 && (
                    <Badge variant="destructive" className="ml-2">{overdueCount + dueSoonCount}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="recent">
                  On Track
                  {onTrackCount > 0 && (
                    <Badge variant="secondary" className="ml-2">{onTrackCount}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value={filterTab} className="mt-6">
                {sortedContacts.length === 0 ? (
                  <Card className="p-8">
                    <p className="text-center text-muted-foreground">No contacts in this category</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedContacts.map(({ contact }) => (
                      <ContactCard
                        key={contact.id}
                        contact={contact}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
          </DialogHeader>
          {editingContact && (
            <ContactForm
              onSubmit={handleEditContact}
              defaultValues={editingContact}
              submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
          </DialogHeader>
          <ContactForm
            onSubmit={handleAddContact}
            submitLabel="Add Contact"
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingContactId} onOpenChange={() => setDeletingContactId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contact? This action cannot be undone and will also delete all associated interactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!safeMode && (
        <SuggestionsPanel
          isOpen={isSuggestionsPanelOpen}
          onClose={() => setIsSuggestionsPanelOpen(false)}
        />
      )}

      <DiagnosticsPanel />
    </div>
  );
}
