import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FoundItem, LostItem, LostItemStatus, FoundItemStatus, ItemCategory } from '../types/item';
import { MatchCandidate, RankingWeights } from '../types/matching';
import { itemsService } from '../services/itemsService';
import { DEFAULT_RANKING_WEIGHTS } from '../lib/constants';
import { useNotifications } from './NotificationContext';

interface ItemsContextType {
  foundItems: FoundItem[];
  lostItems: LostItem[];
  isLoading: boolean;
  refreshItems: () => Promise<void>;
  reportLostItem: (
    data: Omit<LostItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>,
    imageFile?: File
  ) => Promise<{ item: LostItem; embedding: number[] }>;
  reportFoundItem: (
    data: Omit<FoundItem, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'isApproved'>,
    imageFile?: File
  ) => Promise<{ item: FoundItem; embedding: number[] }>;
  getMatchesForLostItem: (
    lostItemId: string,
    weights?: RankingWeights
  ) => Promise<MatchCandidate[]>;
  updateLostStatus: (id: string, status: LostItemStatus) => Promise<void>;
  updateFoundStatus: (id: string, status: FoundItemStatus) => Promise<void>;
  toggleItemApproval: (id: string, isApproved: boolean) => Promise<void>;
  resetDemoData: () => Promise<void>;
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

export const ItemsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useNotifications();

  const refreshItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const [found, lost] = await Promise.all([
        itemsService.getFoundItems(),
        itemsService.getLostItems(),
      ]);
      setFoundItems(found);
      setLostItems(lost);
    } catch (e) {
      console.error('Error fetching items:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshItems();
  }, [refreshItems]);

  const reportLostItem = async (
    data: Omit<LostItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>,
    imageFile?: File
  ) => {
    setIsLoading(true);
    try {
      const result = await itemsService.createLostItem(data, imageFile);
      setLostItems((prev) => [result.item, ...prev]);
      showToast({
        type: 'success',
        title: 'Lost Item Reported!',
        message: 'Your report has been logged and our AI matching engine is scanning found records.',
      });
      return result;
    } catch (e) {
      showToast({
        type: 'error',
        title: 'Failed to Report Lost Item',
        message: (e as Error).message,
      });
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const reportFoundItem = async (
    data: Omit<FoundItem, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'isApproved'>,
    imageFile?: File
  ) => {
    setIsLoading(true);
    try {
      const result = await itemsService.createFoundItem(data, imageFile);
      setFoundItems((prev) => [result.item, ...prev]);
      showToast({
        type: 'success',
        title: 'Found Item Listed!',
        message: 'Thank you for helping our community! Visual embeddings have been indexed.',
      });
      return result;
    } catch (e) {
      showToast({
        type: 'error',
        title: 'Failed to List Found Item',
        message: (e as Error).message,
      });
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const getMatchesForLostItem = async (
    lostItemId: string,
    weights: RankingWeights = DEFAULT_RANKING_WEIGHTS
  ): Promise<MatchCandidate[]> => {
    let lostItem = lostItems.find((i) => i.id === lostItemId);
    if (!lostItem) {
      lostItem = (await itemsService.getLostItemById(lostItemId)) || undefined;
    }
    if (!lostItem) {
      throw new Error(`Lost item not found with id: ${lostItemId}`);
    }

    return itemsService.findMatchesForLostItem(lostItem, undefined, undefined, weights);
  };

  const updateLostStatus = async (id: string, status: LostItemStatus) => {
    await itemsService.updateLostItemStatus(id, status);
    setLostItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i))
    );
  };

  const updateFoundStatus = async (id: string, status: FoundItemStatus) => {
    await itemsService.updateFoundItemStatus(id, status);
    setFoundItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i))
    );
  };

  const toggleItemApproval = async (id: string, isApproved: boolean) => {
    await itemsService.setItemApproval(id, isApproved);
    setFoundItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isApproved } : i))
    );
    showToast({
      type: 'info',
      title: isApproved ? 'Listing Approved' : 'Listing Hidden',
      message: `Item has been ${isApproved ? 'approved for public search' : 'flagged and hidden from public view'}.`,
    });
  };

  const resetDemoData = async () => {
    itemsService.resetToSeedData();
    await refreshItems();
    showToast({
      type: 'info',
      title: 'Demo Data Reset',
      message: 'All sample lost & found listings have been restored to initial state.',
    });
  };

  return (
    <ItemsContext.Provider
      value={{
        foundItems,
        lostItems,
        isLoading,
        refreshItems,
        reportLostItem,
        reportFoundItem,
        getMatchesForLostItem,
        updateLostStatus,
        updateFoundStatus,
        toggleItemApproval,
        resetDemoData,
      }}
    >
      {children}
    </ItemsContext.Provider>
  );
};

export const useItems = () => {
  const context = useContext(ItemsContext);
  if (!context) {
    throw new Error('useItems must be used within an ItemsProvider');
  }
  return context;
};
