import { useState, useCallback } from 'react';
import { useContactStore } from '@/store/contactStore';
import { checkLinkedInInteractions, isDuplicateInteraction } from '@/services/linkedInSyncService';
import { toast } from 'sonner';

export function useLinkedInSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const { contacts, interactions, addSuggestion, updateSyncStatus } = useContactStore();

  const syncLinkedInInteractions = useCallback(async () => {
    setIsSyncing(true);
    
    try {
      // Update status for all sync-enabled contacts
      contacts
        .filter(c => c.linkedInAutoSync)
        .forEach(c => updateSyncStatus(c.id, 'syncing'));

      // Check LinkedIn for new interactions
      const detectedInteractions = await checkLinkedInInteractions(contacts);

      // Filter out duplicates
      const newInteractions = detectedInteractions.filter(
        detected => !isDuplicateInteraction(detected, interactions)
      );

      // Add suggestions for new interactions
      newInteractions.forEach(interaction => {
        addSuggestion(interaction);
      });

      // Update sync status to enabled
      contacts
        .filter(c => c.linkedInAutoSync)
        .forEach(c => updateSyncStatus(c.id, 'enabled'));

      if (newInteractions.length > 0) {
        toast.success(`Found ${newInteractions.length} new LinkedIn interaction${newInteractions.length > 1 ? 's' : ''}!`);
      }

      return newInteractions.length;
    } catch (error) {
      console.error('LinkedIn sync error:', error);
      
      // Update status to error
      contacts
        .filter(c => c.linkedInAutoSync)
        .forEach(c => updateSyncStatus(c.id, 'error'));
      
      toast.error('Failed to sync LinkedIn interactions');
      return 0;
    } finally {
      setIsSyncing(false);
    }
  }, [contacts, interactions, addSuggestion, updateSyncStatus]);

  return {
    syncLinkedInInteractions,
    isSyncing,
  };
}
