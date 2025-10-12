import { Contact, InteractionType } from "@/store/contactStore";

// Mock data for demo - simulates detecting LinkedIn interactions
const mockLinkedInInteractions = [
  {
    type: 'linkedin' as InteractionType,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    notes: 'Exchanged messages about upcoming project collaboration',
  },
  {
    type: 'linkedin' as InteractionType,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    notes: 'Discussed industry trends and shared article',
  },
];

export interface DetectedInteraction {
  contactId: string;
  contactName: string;
  type: InteractionType;
  timestamp: Date;
  notes?: string;
}

/**
 * Mock function that simulates checking LinkedIn for new interactions
 * In a real implementation, this would:
 * 1. Use LinkedIn API or browser extension to detect messages/interactions
 * 2. Match interactions to contacts based on LinkedIn profile URLs
 * 3. Return only new interactions not yet logged
 */
export async function checkLinkedInInteractions(
  contacts: Contact[]
): Promise<DetectedInteraction[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const detectedInteractions: DetectedInteraction[] = [];

  // Only check contacts with LinkedIn profiles and auto-sync enabled
  const syncEnabledContacts = contacts.filter(
    c => c.linkedinProfile && c.linkedInAutoSync
  );

  // Mock: randomly detect interactions for some contacts (30% chance)
  syncEnabledContacts.forEach(contact => {
    if (Math.random() > 0.7) {
      const mockInteraction = mockLinkedInInteractions[
        Math.floor(Math.random() * mockLinkedInInteractions.length)
      ];
      
      detectedInteractions.push({
        contactId: contact.id,
        contactName: contact.name,
        ...mockInteraction,
      });
    }
  });

  return detectedInteractions;
}

/**
 * Checks for duplicate interactions to avoid logging the same interaction twice
 */
export function isDuplicateInteraction(
  newInteraction: DetectedInteraction,
  existingInteractions: Array<{
    contactId: string;
    type: InteractionType;
    timestamp: Date;
  }>
): boolean {
  return existingInteractions.some(existing => {
    const timeDiff = Math.abs(
      new Date(existing.timestamp).getTime() - newInteraction.timestamp.getTime()
    );
    // Consider duplicate if same contact, type, and within 1 hour
    return (
      existing.contactId === newInteraction.contactId &&
      existing.type === newInteraction.type &&
      timeDiff < 60 * 60 * 1000
    );
  });
}
