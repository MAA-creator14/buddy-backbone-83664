import { create } from 'zustand';

// Simplified store - only for UI state, not data persistence
interface ContactStore {
  selectedFilter: 'all' | 'due' | 'recent';
  setSelectedFilter: (filter: 'all' | 'due' | 'recent') => void;
}

export const useContactStore = create<ContactStore>((set) => ({
  selectedFilter: 'all',
  setSelectedFilter: (filter) => set({ selectedFilter: filter }),
}));
