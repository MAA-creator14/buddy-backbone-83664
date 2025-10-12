import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type RelationshipType = 'peer' | 'mentor' | 'client';
export type InteractionType = 'call' | 'coffee' | 'message' | 'email' | 'linkedin';

export type LinkedInSyncStatus = 'enabled' | 'disabled' | 'syncing' | 'error';

export type EngagementFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'biannually' | 'annually' | null;

export interface InteractionSuggestion {
  id: string;
  contactId: string;
  contactName: string;
  type: InteractionType;
  timestamp: Date;
  notes?: string;
  detectedAt: Date;
  status: 'pending' | 'accepted' | 'dismissed';
}

export interface Interaction {
  id: string;
  contactId: string;
  type: InteractionType;
  timestamp: Date;
  notes?: string;
  source?: 'manual' | 'linkedin-auto';
  isAutoLogged?: boolean;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  company: string;
  role: string;
  relationshipType: RelationshipType;
  linkedinProfile?: string;
  notes?: string;
  createdAt: Date;
  linkedInAutoSync?: boolean;
  lastSyncAt?: Date;
  syncStatus?: LinkedInSyncStatus;
  lastContacted?: Date;
  engagementFrequency?: EngagementFrequency;
}

interface ContactStore {
  contacts: Contact[];
  interactions: Interaction[];
  suggestions: InteractionSuggestion[];
  addContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => void;
  updateContact: (id: string, contact: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  clearContacts: () => void;
  addInteraction: (interaction: Omit<Interaction, 'id'>) => void;
  getInteractionsByContact: (contactId: string) => Interaction[];
  deleteInteraction: (id: string) => void;
  addSuggestion: (suggestion: Omit<InteractionSuggestion, 'id' | 'detectedAt' | 'status'>) => void;
  acceptSuggestion: (suggestionId: string) => void;
  dismissSuggestion: (suggestionId: string) => void;
  editSuggestion: (suggestionId: string, updates: Partial<InteractionSuggestion>) => void;
  getPendingSuggestions: () => InteractionSuggestion[];
  updateSyncStatus: (contactId: string, status: LinkedInSyncStatus) => void;
}

// Helper function to calculate due status
export const getContactDueStatus = (contact: Contact, interactions: Interaction[]): 'overdue' | 'due-soon' | 'on-track' | 'no-frequency' => {
  if (!contact.engagementFrequency) return 'no-frequency';
  
  const contactInteractions = interactions.filter(i => i.contactId === contact.id);
  const lastInteraction = contactInteractions.length > 0 
    ? contactInteractions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
    : null;
  
  const lastDate = lastInteraction?.timestamp || contact.lastContacted || contact.createdAt;
  const daysSinceLastContact = Math.floor((Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24));
  
  const frequencyDays: Record<NonNullable<EngagementFrequency>, number> = {
    'weekly': 7,
    'biweekly': 14,
    'monthly': 30,
    'quarterly': 90,
    'biannually': 180,
    'annually': 365,
  };
  
  const targetDays = frequencyDays[contact.engagementFrequency];
  const warningThreshold = targetDays * 0.8; // 80% of target
  
  if (daysSinceLastContact >= targetDays) return 'overdue';
  if (daysSinceLastContact >= warningThreshold) return 'due-soon';
  return 'on-track';
};

export const useContactStore = create<ContactStore>()(
  persist(
    (set, get) => ({
      contacts: [],
      interactions: [],
      suggestions: [],
      
      addContact: (contact) => set((state) => ({
        contacts: [...state.contacts, {
          ...contact,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        }]
      })),
      
      updateContact: (id, updates) => set((state) => ({
        contacts: state.contacts.map(c => 
          c.id === id ? { ...c, ...updates } : c
        )
      })),
      
      deleteContact: (id) => set((state) => ({
        contacts: state.contacts.filter(c => c.id !== id),
        interactions: state.interactions.filter(i => i.contactId !== id)
      })),
      
      clearContacts: () => set({ contacts: [], interactions: [] }),

      addInteraction: (interaction) => set((state) => ({
        interactions: [...state.interactions, {
          ...interaction,
          id: crypto.randomUUID(),
        }]
      })),

      getInteractionsByContact: (contactId) => {
        return get().interactions
          .filter(i => i.contactId === contactId)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      },

      deleteInteraction: (id) => set((state) => ({
        interactions: state.interactions.filter(i => i.id !== id)
      })),

      addSuggestion: (suggestion) => set((state) => ({
        suggestions: [...state.suggestions, {
          ...suggestion,
          id: crypto.randomUUID(),
          detectedAt: new Date(),
          status: 'pending' as const,
        }]
      })),

      acceptSuggestion: (suggestionId) => {
        const suggestion = get().suggestions.find(s => s.id === suggestionId);
        if (suggestion) {
          get().addInteraction({
            contactId: suggestion.contactId,
            type: suggestion.type,
            timestamp: suggestion.timestamp,
            notes: suggestion.notes,
            source: 'linkedin-auto',
            isAutoLogged: true,
          });
          set((state) => ({
            suggestions: state.suggestions.filter(s => s.id !== suggestionId)
          }));
        }
      },

      dismissSuggestion: (suggestionId) => set((state) => ({
        suggestions: state.suggestions.filter(s => s.id !== suggestionId)
      })),

      editSuggestion: (suggestionId, updates) => set((state) => ({
        suggestions: state.suggestions.map(s =>
          s.id === suggestionId ? { ...s, ...updates } : s
        )
      })),

      getPendingSuggestions: () => {
        return get().suggestions.filter(s => s.status === 'pending');
      },

      updateSyncStatus: (contactId, status) => set((state) => ({
        contacts: state.contacts.map(c =>
          c.id === contactId ? { ...c, syncStatus: status, lastSyncAt: new Date() } : c
        )
      })),
    }),
    {
      name: 'contact-storage',
      partialize: (state) => ({
        contacts: state.contacts,
        interactions: state.interactions,
        suggestions: state.suggestions,
      }),
      storage: {
        getItem: (name) => {
          try {
            const str = localStorage.getItem(name);
            if (!str) return null;
            
            const parsed = JSON.parse(str);
            const state = parsed.state;
            
            if (!state) return null;
            
            return {
              state: {
                contacts: state.contacts?.map((c: any) => ({
                  ...c,
                  createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
                  lastSyncAt: c.lastSyncAt ? new Date(c.lastSyncAt) : undefined,
                })) || [],
                interactions: state.interactions?.map((i: any) => ({
                  ...i,
                  timestamp: i.timestamp ? new Date(i.timestamp) : new Date(),
                })) || [],
                suggestions: state.suggestions?.map((s: any) => ({
                  ...s,
                  timestamp: s.timestamp ? new Date(s.timestamp) : new Date(),
                  detectedAt: s.detectedAt ? new Date(s.detectedAt) : new Date(),
                })) || [],
              },
            };
          } catch (error) {
            console.error('Failed to load from localStorage:', error);
            // Reset storage on error to prevent infinite loops
            localStorage.removeItem(name);
            return null;
          }
        },
        setItem: (name, newValue) => {
          try {
            const str = JSON.stringify({
              state: {
                ...newValue.state,
              },
            });
            localStorage.setItem(name, str);
          } catch (error) {
            console.error('Failed to save to localStorage:', error);
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch (error) {
            console.error('Failed to remove from localStorage:', error);
          }
        },
      },
    }
  )
);
