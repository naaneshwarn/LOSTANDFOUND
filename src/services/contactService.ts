import { ContactRequest, Message, NotificationItem } from '../types/auth';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  INITIAL_CONTACT_REQUESTS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
} from './mockData';
import { itemsService } from './itemsService';

const STORAGE_REQUESTS_KEY = 'lostfound_requests_v1';
const STORAGE_MESSAGES_KEY = 'lostfound_messages_v1';
const STORAGE_NOTIF_KEY = 'lostfound_notifs_v1';

function getLocalRequests(): ContactRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_REQUESTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(INITIAL_CONTACT_REQUESTS));
  return INITIAL_CONTACT_REQUESTS;
}

function setLocalRequests(requests: ContactRequest[]): void {
  localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(requests));
}

function getLocalMessages(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_MESSAGES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(INITIAL_MESSAGES));
  return INITIAL_MESSAGES;
}

function setLocalMessages(messages: Message[]): void {
  localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(messages));
}

function getLocalNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_NOTIF_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  localStorage.setItem(STORAGE_NOTIF_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
  return INITIAL_NOTIFICATIONS;
}

function setLocalNotifications(notifications: NotificationItem[]): void {
  localStorage.setItem(STORAGE_NOTIF_KEY, JSON.stringify(notifications));
}

export const contactService = {
  /**
   * Get all contact requests where user is requester or recipient
   */
  async getContactRequests(userId: string): Promise<ContactRequest[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('contact_requests')
          .select('*')
          .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((d) => ({
            id: d.id,
            lostItemId: d.lost_item_id || undefined,
            foundItemId: d.found_item_id,
            requesterId: d.requester_id,
            recipientId: d.recipient_id,
            message: d.message,
            status: d.status as any,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          }));
        }
      } catch (e) {
        console.warn('Falling back to local requests:', e);
      }
    }

    const all = getLocalRequests();
    return all.filter((r) => r.requesterId === userId || r.recipientId === userId);
  },

  /**
   * Get single contact request by ID
   */
  async getContactRequestById(id: string): Promise<ContactRequest | null> {
    const all = getLocalRequests();
    return all.find((r) => r.id === id) || null;
  },

  /**
   * Create a new contact request
   */
  async createContactRequest(params: {
    lostItemId?: string;
    foundItemId: string;
    requesterId: string;
    recipientId: string;
    requesterName: string;
    recipientName?: string;
    itemTitle: string;
    initialMessage: string;
  }): Promise<ContactRequest> {
    const newReq: ContactRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      lostItemId: params.lostItemId,
      foundItemId: params.foundItemId,
      requesterId: params.requesterId,
      recipientId: params.recipientId,
      requesterName: params.requesterName,
      recipientName: params.recipientName,
      itemTitle: params.itemTitle,
      message: params.initialMessage,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('contact_requests').insert({
          id: newReq.id,
          lost_item_id: newReq.lostItemId || null,
          found_item_id: newReq.foundItemId,
          requester_id: newReq.requesterId,
          recipient_id: newReq.recipientId,
          message: newReq.message,
          status: newReq.status,
        });

        // Insert initial message
        await supabase.from('messages').insert({
          contact_request_id: newReq.id,
          sender_id: newReq.requesterId,
          content: newReq.message,
        });
      } catch (e) {
        console.warn('Failed in Supabase, continuing locally:', e);
      }
    }

    // Save locally
    const current = getLocalRequests();
    setLocalRequests([newReq, ...current]);

    // Also add initial message to thread
    const newMsg: Message = {
      id: `msg_${Date.now()}_init`,
      contactRequestId: newReq.id,
      senderId: newReq.requesterId,
      senderName: params.requesterName,
      content: params.initialMessage,
      isRead: true,
      createdAt: new Date().toISOString(),
    };
    const messages = getLocalMessages();
    setLocalMessages([...messages, newMsg]);

    // Send in-app notification to recipient
    await this.createNotification({
      userId: params.recipientId,
      title: 'New Contact Request',
      message: `${params.requesterName} sent a contact request regarding "${params.itemTitle}".`,
      type: 'contact_request',
      linkUrl: `/requests`,
    });

    return newReq;
  },

  /**
   * Update request status (e.g. accepted, rejected)
   */
  async updateRequestStatus(
    requestId: string,
    status: 'accepted' | 'rejected' | 'cancelled'
  ): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('contact_requests').update({ status }).eq('id', requestId);
      } catch (e) {
        console.warn(e);
      }
    }

    const current = getLocalRequests();
    const updated = current.map((r) =>
      r.id === requestId ? { ...r, status, updatedAt: new Date().toISOString() } : r
    );
    setLocalRequests(updated);
  },

  /**
   * Get messages for a contact request
   */
  async getMessages(contactRequestId: string): Promise<Message[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('contact_request_id', contactRequestId)
          .order('created_at', { ascending: true });

        if (!error && data) {
          return data.map((d) => ({
            id: d.id,
            contactRequestId: d.contact_request_id,
            senderId: d.sender_id,
            content: d.content,
            isRead: d.is_read,
            createdAt: d.created_at,
          }));
        }
      } catch (e) {
        console.warn(e);
      }
    }

    const messages = getLocalMessages();
    return messages.filter((m) => m.contactRequestId === contactRequestId);
  },

  /**
   * Send a new message in a conversation thread
   */
  async sendMessage(params: {
    contactRequestId: string;
    senderId: string;
    senderName?: string;
    content: string;
  }): Promise<Message> {
    const newMsg: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      contactRequestId: params.contactRequestId,
      senderId: params.senderId,
      senderName: params.senderName,
      content: params.content,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('messages').insert({
          id: newMsg.id,
          contact_request_id: newMsg.contactRequestId,
          sender_id: newMsg.senderId,
          content: newMsg.content,
          is_read: false,
        });
      } catch (e) {
        console.warn(e);
      }
    }

    const current = getLocalMessages();
    setLocalMessages([...current, newMsg]);

    return newMsg;
  },

  /**
   * Confirm recovery of an item
   * Transitions lost item to 'resolved' and found item to 'handed_over'
   */
  async confirmItemRecovery(requestId: string): Promise<void> {
    const req = await this.getContactRequestById(requestId);
    if (!req) return;

    await this.updateRequestStatus(requestId, 'accepted');

    if (req.lostItemId) {
      await itemsService.updateLostItemStatus(req.lostItemId, 'resolved');
    }
    if (req.foundItemId) {
      await itemsService.updateFoundItemStatus(req.foundItemId, 'handed_over');
    }

    // Notify both users
    await this.createNotification({
      userId: req.requesterId,
      title: 'Item Marked as Recovered! 🎉',
      message: 'Congratulations! Your lost item has been officially confirmed as recovered.',
      type: 'item_resolved',
      linkUrl: `/dashboard`,
    });

    await this.createNotification({
      userId: req.recipientId,
      title: 'Item Handover Complete! 🌟',
      message: 'Thank you for your honesty and for helping return this lost item to its owner.',
      type: 'item_resolved',
      linkUrl: `/dashboard`,
    });
  },

  /**
   * Notification management
   */
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    const all = getLocalNotifications();
    return all.filter((n) => n.userId === userId);
  },

  async markNotificationAsRead(id: string): Promise<void> {
    const all = getLocalNotifications();
    const updated = all.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    setLocalNotifications(updated);
  },

  async createNotification(notif: Omit<NotificationItem, 'id' | 'isRead' | 'createdAt'>): Promise<void> {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    const all = getLocalNotifications();
    setLocalNotifications([newNotif, ...all]);
  },
};
