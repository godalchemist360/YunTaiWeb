import { create } from 'zustand';

interface CreditTransactionStore {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

export const useCreditTransactionStore = create<CreditTransactionStore>(
  (set) => ({
    refreshTrigger: 0,
    triggerRefresh: () =>
      set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
  })
);
