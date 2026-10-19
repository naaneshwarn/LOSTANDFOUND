// Auth and Profile types

export type UserRole = 'user' | 'moderator' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  phoneObfuscated?: string;
  createdAt: string;
}

export interface DemoPersona {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl: string;
  description: string;
}

export interface ContactRequest {
  id: string;
  lostItemId?: string;
  foundItemId: string;
  requesterId: string;
  recipientId: string;
  requesterName?: string;
  recipientName?: string;
  itemTitle?: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  contactRequestId: string;
  senderId: string;
  senderName?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'match_found' | 'contact_request' | 'message_received' | 'item_resolved' | 'admin_alert';
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}
