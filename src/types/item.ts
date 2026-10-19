// Item types and categories

export type ItemCategory =
  | 'Electronics'
  | 'Bags'
  | 'Wallets'
  | 'Keys'
  | 'Documents'
  | 'Clothing'
  | 'Accessories'
  | 'Books'
  | 'ID Cards'
  | 'Other';

export type LostItemStatus =
  | 'open'
  | 'match_found'
  | 'contact_requested'
  | 'resolved'
  | 'closed';

export type FoundItemStatus =
  | 'available'
  | 'claimed'
  | 'resolved'
  | 'handed_over';

export type ContactPreference = 'in_app' | 'email_relay' | 'finder_choice';
export type SafeContactMethod = 'in_app' | 'secure_dropoff' | 'campus_security';

export interface LostItem {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  title: string;
  category: ItemCategory;
  description: string;
  brand?: string;
  color?: string;
  identifyingMarks?: string;
  locationLost: string;
  dateLost: string; // ISO date YYYY-MM-DD
  timeLost?: string;
  imageUrl: string;
  imageStoragePath?: string;
  rewardAmount?: number;
  contactPreference: ContactPreference;
  status: LostItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FoundItem {
  id: string;
  finderId: string;
  finderEmail?: string;
  finderName?: string;
  title: string;
  category: ItemCategory;
  description: string;
  brand?: string;
  color?: string;
  identifyingMarks?: string;
  locationFound: string;
  dateFound: string; // ISO date YYYY-MM-DD
  imageUrl: string;
  imageStoragePath?: string;
  safeContactMethod: SafeContactMethod;
  status: FoundItemStatus;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ItemStatusHistoryEntry {
  id: string;
  itemType: 'lost' | 'found';
  itemId: string;
  changedBy: string;
  oldStatus: string;
  newStatus: string;
  note?: string;
  createdAt: string;
}
