import { FoundItem, LostItem, LostItemStatus, FoundItemStatus, ItemCategory } from '../types/item';
import { MatchCandidate, MatchSearchParams, RankingWeights } from '../types/matching';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  INITIAL_FOUND_ITEMS,
  INITIAL_LOST_ITEMS,
  SEEDED_ITEM_EMBEDDINGS,
} from './mockData';
import { getActiveEmbeddingProvider, matchImageWithCandidates } from './ai';
import { fileToBase64 } from '../lib/utils';
import { generateDeterministicVector } from './ai/demoProvider';

const STORAGE_FOUND_KEY = 'lostfound_items_found_v1';
const STORAGE_LOST_KEY = 'lostfound_items_lost_v1';
const STORAGE_EMBED_KEY = 'lostfound_items_embeddings_v1';

// Local storage helpers for seamless offline/demo operation
function getLocalFoundItems(): FoundItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_FOUND_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  localStorage.setItem(STORAGE_FOUND_KEY, JSON.stringify(INITIAL_FOUND_ITEMS));
  return INITIAL_FOUND_ITEMS;
}

function setLocalFoundItems(items: FoundItem[]): void {
  localStorage.setItem(STORAGE_FOUND_KEY, JSON.stringify(items));
}

function getLocalLostItems(): LostItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_LOST_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  localStorage.setItem(STORAGE_LOST_KEY, JSON.stringify(INITIAL_LOST_ITEMS));
  return INITIAL_LOST_ITEMS;
}

function setLocalLostItems(items: LostItem[]): void {
  localStorage.setItem(STORAGE_LOST_KEY, JSON.stringify(items));
}

function getLocalEmbeddings(): Record<string, number[]> {
  try {
    const raw = localStorage.getItem(STORAGE_EMBED_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  localStorage.setItem(STORAGE_EMBED_KEY, JSON.stringify(SEEDED_ITEM_EMBEDDINGS));
  return SEEDED_ITEM_EMBEDDINGS;
}

function saveLocalEmbedding(itemId: string, vector: number[]): void {
  const current = getLocalEmbeddings();
  current[itemId] = vector;
  localStorage.setItem(STORAGE_EMBED_KEY, JSON.stringify(current));
}

// ==============================================================================
// ITEMS SERVICE API
// ==============================================================================

export const itemsService = {
  /**
   * Fetch all approved found items (with optional filters)
   */
  async getFoundItems(filters?: {
    category?: ItemCategory;
    status?: FoundItemStatus;
    searchQuery?: string;
  }): Promise<FoundItem[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('found_items')
          .select('*')
          .eq('is_approved', true)
          .order('date_found', { ascending: false });

        if (filters?.category) {
          query = query.eq('category', filters.category);
        }
        if (filters?.status) {
          query = query.eq('status', filters.status);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data.map((d) => ({
            id: d.id,
            finderId: d.finder_id,
            title: d.title,
            category: d.category as ItemCategory,
            description: d.description,
            brand: d.brand || undefined,
            color: d.color || undefined,
            identifyingMarks: d.identifying_marks || undefined,
            locationFound: d.location_found,
            dateFound: d.date_found,
            imageUrl: d.image_url,
            imageStoragePath: d.image_storage_path || undefined,
            safeContactMethod: (d.safe_contact_method as any) || 'in_app',
            status: d.status as FoundItemStatus,
            isApproved: d.is_approved,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          }));
        }
      } catch (e) {
        console.warn('Falling back to local found items store:', e);
      }
    }

    // Local/Demo Mode
    let items = getLocalFoundItems();
    if (filters?.category) {
      items = items.filter((i) => i.category === filters.category);
    }
    if (filters?.status) {
      items = items.filter((i) => i.status === filters.status);
    }
    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.locationFound.toLowerCase().includes(q) ||
          (i.brand && i.brand.toLowerCase().includes(q))
      );
    }
    return items;
  },

  /**
   * Get single found item by ID
   */
  async getFoundItemById(id: string): Promise<FoundItem | null> {
    const items = await this.getFoundItems();
    return items.find((i) => i.id === id) || null;
  },

  /**
   * Fetch all lost items (with optional user filter)
   */
  async getLostItems(filters?: {
    userId?: string;
    category?: ItemCategory;
    status?: LostItemStatus;
    searchQuery?: string;
  }): Promise<LostItem[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('lost_items')
          .select('*')
          .order('date_lost', { ascending: false });

        if (filters?.userId) {
          query = query.eq('user_id', filters.userId);
        }
        if (filters?.category) {
          query = query.eq('category', filters.category);
        }
        if (filters?.status) {
          query = query.eq('status', filters.status);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data.map((d) => ({
            id: d.id,
            userId: d.user_id,
            title: d.title,
            category: d.category as ItemCategory,
            description: d.description,
            brand: d.brand || undefined,
            color: d.color || undefined,
            identifyingMarks: d.identifying_marks || undefined,
            locationLost: d.location_lost,
            dateLost: d.date_lost,
            timeLost: d.time_lost || undefined,
            imageUrl: d.image_url,
            imageStoragePath: d.image_storage_path || undefined,
            rewardAmount: d.reward_amount || undefined,
            contactPreference: (d.contact_preference as any) || 'in_app',
            status: d.status as LostItemStatus,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          }));
        }
      } catch (e) {
        console.warn('Falling back to local lost items store:', e);
      }
    }

    let items = getLocalLostItems();
    if (filters?.userId) {
      items = items.filter((i) => i.userId === filters.userId);
    }
    if (filters?.category) {
      items = items.filter((i) => i.category === filters.category);
    }
    if (filters?.status) {
      items = items.filter((i) => i.status === filters.status);
    }
    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.locationLost.toLowerCase().includes(q) ||
          (i.brand && i.brand.toLowerCase().includes(q))
      );
    }
    return items;
  },

  /**
   * Get single lost item by ID
   */
  async getLostItemById(id: string): Promise<LostItem | null> {
    const items = await this.getLostItems();
    return items.find((i) => i.id === id) || null;
  },

  /**
   * Create a new Lost Item Report and generate its image embedding
   */
  async createLostItem(
    itemData: Omit<LostItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>,
    imageFile?: File
  ): Promise<{ item: LostItem; embedding: number[] }> {
    let imageUrl = itemData.imageUrl;
    let imageStoragePath: string | undefined = undefined;

    // Handle image upload if a File was provided
    if (imageFile) {
      if (isSupabaseConfigured) {
        try {
          const fileExt = imageFile.name.split('.').pop();
          const filePath = `lost/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('item-photos')
            .upload(filePath, imageFile, { contentType: imageFile.type });

          if (!uploadError) {
            const { data } = supabase.storage.from('item-photos').getPublicUrl(filePath);
            imageUrl = data.publicUrl;
            imageStoragePath = filePath;
          }
        } catch (e) {
          console.warn('Image storage upload failed, falling back to base64 data URL', e);
          imageUrl = await fileToBase64(imageFile);
        }
      } else {
        imageUrl = await fileToBase64(imageFile);
      }
    }

    const newItem: LostItem = {
      ...itemData,
      id: `lost_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      imageUrl,
      imageStoragePath,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Generate image embedding using configured provider
    const provider = getActiveEmbeddingProvider();
    const embedResult = await provider.generateEmbedding(imageFile || imageUrl);

    // Save item
    if (isSupabaseConfigured) {
      try {
        await supabase.from('lost_items').insert({
          id: newItem.id,
          user_id: newItem.userId,
          title: newItem.title,
          category: newItem.category,
          description: newItem.description,
          brand: newItem.brand || null,
          color: newItem.color || null,
          identifying_marks: newItem.identifyingMarks || null,
          location_lost: newItem.locationLost,
          date_lost: newItem.dateLost,
          time_lost: newItem.timeLost || null,
          image_url: newItem.imageUrl,
          image_storage_path: newItem.imageStoragePath || null,
          reward_amount: newItem.rewardAmount || 0,
          contact_preference: newItem.contactPreference,
          status: newItem.status,
        });

        await supabase.from('image_embeddings').insert({
          item_type: 'lost',
          item_id: newItem.id,
          embedding: embedResult.embedding as any,
          dimension: embedResult.dimension,
          model_name: embedResult.model,
          model_version: embedResult.version,
          image_hash: embedResult.imageHash || null,
        });
      } catch (e) {
        console.warn('Supabase insert failed, saving locally:', e);
      }
    }

    // Always persist to local store for offline continuity
    const currentLost = getLocalLostItems();
    setLocalLostItems([newItem, ...currentLost]);
    saveLocalEmbedding(newItem.id, embedResult.embedding);

    return { item: newItem, embedding: embedResult.embedding };
  },

  /**
   * Create a new Found Item Report and generate its image embedding
   */
  async createFoundItem(
    itemData: Omit<FoundItem, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'isApproved'>,
    imageFile?: File
  ): Promise<{ item: FoundItem; embedding: number[] }> {
    let imageUrl = itemData.imageUrl;
    let imageStoragePath: string | undefined = undefined;

    if (imageFile) {
      if (isSupabaseConfigured) {
        try {
          const fileExt = imageFile.name.split('.').pop();
          const filePath = `found/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('item-photos')
            .upload(filePath, imageFile, { contentType: imageFile.type });

          if (!uploadError) {
            const { data } = supabase.storage.from('item-photos').getPublicUrl(filePath);
            imageUrl = data.publicUrl;
            imageStoragePath = filePath;
          }
        } catch {
          imageUrl = await fileToBase64(imageFile);
        }
      } else {
        imageUrl = await fileToBase64(imageFile);
      }
    }

    const newItem: FoundItem = {
      ...itemData,
      id: `found_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      imageUrl,
      imageStoragePath,
      status: 'available',
      isApproved: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const provider = getActiveEmbeddingProvider();
    const embedResult = await provider.generateEmbedding(imageFile || imageUrl);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('found_items').insert({
          id: newItem.id,
          finder_id: newItem.finderId,
          title: newItem.title,
          category: newItem.category,
          description: newItem.description,
          brand: newItem.brand || null,
          color: newItem.color || null,
          identifying_marks: newItem.identifyingMarks || null,
          location_found: newItem.locationFound,
          date_found: newItem.dateFound,
          image_url: newItem.imageUrl,
          image_storage_path: newItem.imageStoragePath || null,
          safe_contact_method: newItem.safeContactMethod,
          status: newItem.status,
          is_approved: newItem.isApproved,
        });

        await supabase.from('image_embeddings').insert({
          item_type: 'found',
          item_id: newItem.id,
          embedding: embedResult.embedding as any,
          dimension: embedResult.dimension,
          model_name: embedResult.model,
          model_version: embedResult.version,
          image_hash: embedResult.imageHash || null,
        });
      } catch (e) {
        console.warn('Supabase found item insert failed:', e);
      }
    }

    const currentFound = getLocalFoundItems();
    setLocalFoundItems([newItem, ...currentFound]);
    saveLocalEmbedding(newItem.id, embedResult.embedding);

    return { item: newItem, embedding: embedResult.embedding };
  },

  /**
   * Find candidate matches for a lost item using Cosine Similarity & Multi-Signal Ranking
   */
  async findMatchesForLostItem(
    lostItem: LostItem,
    queryEmbedding?: number[],
    params?: Partial<MatchSearchParams>,
    weights?: RankingWeights
  ): Promise<MatchCandidate[]> {
    // 1. Resolve embedding for the lost item
    let embedding = queryEmbedding;
    if (!embedding) {
      const localEmbeddings = getLocalEmbeddings();
      embedding = localEmbeddings[lostItem.id];
    }
    if (!embedding) {
      const provider = getActiveEmbeddingProvider();
      const res = await provider.generateEmbedding(lostItem.imageUrl);
      embedding = res.embedding;
      saveLocalEmbedding(lostItem.id, embedding);
    }

    // 2. Retrieve all candidate found items and their embeddings
    const foundItems = await this.getFoundItems({ status: 'available' });
    const localEmbeddings = getLocalEmbeddings();

    const candidatesWithEmbeddings: Array<{ item: FoundItem; embedding: number[] }> = [];

    for (const item of foundItems) {
      let candEmbedding = localEmbeddings[item.id];
      if (!candEmbedding) {
        // Fallback: generate deterministic vector
        candEmbedding = generateDeterministicVector(item.category.toLowerCase(), item.id);
        saveLocalEmbedding(item.id, candEmbedding);
      }
      candidatesWithEmbeddings.push({ item, embedding: candEmbedding });
    }

    // 3. Execute matching engine
    const searchParams: MatchSearchParams = {
      lostItemId: lostItem.id,
      category: params?.category || lostItem.category,
      location: params?.location || lostItem.locationLost,
      dateLost: params?.dateLost || lostItem.dateLost,
      threshold: params?.threshold ?? 0.30,
      limit: params?.limit ?? 20,
    };

    return matchImageWithCandidates(embedding, candidatesWithEmbeddings, searchParams, weights);
  },

  /**
   * Update lost item status
   */
  async updateLostItemStatus(id: string, status: LostItemStatus): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('lost_items').update({ status }).eq('id', id);
      } catch (e) {
        console.warn('Failed to update status in Supabase', e);
      }
    }
    const items = getLocalLostItems();
    const updated = items.map((i) => (i.id === id ? { ...i, status, updatedAt: new Date().toISOString() } : i));
    setLocalLostItems(updated);
  },

  /**
   * Update found item status
   */
  async updateFoundItemStatus(id: string, status: FoundItemStatus): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('found_items').update({ status }).eq('id', id);
      } catch (e) {
        console.warn('Failed to update status in Supabase', e);
      }
    }
    const items = getLocalFoundItems();
    const updated = items.map((i) => (i.id === id ? { ...i, status, updatedAt: new Date().toISOString() } : i));
    setLocalFoundItems(updated);
  },

  /**
   * Admin: Approve or Reject a found item listing
   */
  async setItemApproval(id: string, isApproved: boolean): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('found_items').update({ is_approved: isApproved }).eq('id', id);
      } catch (e) {
        console.warn('Failed in Supabase', e);
      }
    }
    const items = getLocalFoundItems();
    const updated = items.map((i) => (i.id === id ? { ...i, isApproved } : i));
    setLocalFoundItems(updated);
  },

  /**
   * Reset local storage to initial seed data
   */
  resetToSeedData(): void {
    localStorage.setItem(STORAGE_FOUND_KEY, JSON.stringify(INITIAL_FOUND_ITEMS));
    localStorage.setItem(STORAGE_LOST_KEY, JSON.stringify(INITIAL_LOST_ITEMS));
    localStorage.setItem(STORAGE_EMBED_KEY, JSON.stringify(SEEDED_ITEM_EMBEDDINGS));
  },
};
