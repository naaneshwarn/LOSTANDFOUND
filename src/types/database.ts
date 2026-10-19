// Supabase Database Schema Type Definitions

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: string;
          phone_obfuscated: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          phone_obfuscated?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          phone_obfuscated?: string | null;
          updated_at?: string;
        };
      };
      lost_items: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          category: string;
          description: string;
          brand: string | null;
          color: string | null;
          identifying_marks: string | null;
          location_lost: string;
          date_lost: string;
          time_lost: string | null;
          image_url: string;
          image_storage_path: string | null;
          reward_amount: number | null;
          contact_preference: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          category: string;
          description: string;
          brand?: string | null;
          color?: string | null;
          identifying_marks?: string | null;
          location_lost: string;
          date_lost: string;
          time_lost?: string | null;
          image_url: string;
          image_storage_path?: string | null;
          reward_amount?: number | null;
          contact_preference?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          category?: string;
          description?: string;
          brand?: string | null;
          color?: string | null;
          identifying_marks?: string | null;
          location_lost?: string;
          date_lost?: string;
          time_lost?: string | null;
          image_url?: string;
          image_storage_path?: string | null;
          reward_amount?: number | null;
          contact_preference?: string;
          status?: string;
          updated_at?: string;
        };
      };
      found_items: {
        Row: {
          id: string;
          finder_id: string;
          title: string;
          category: string;
          description: string;
          brand: string | null;
          color: string | null;
          identifying_marks: string | null;
          location_found: string;
          date_found: string;
          image_url: string;
          image_storage_path: string | null;
          safe_contact_method: string;
          status: string;
          is_approved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          finder_id: string;
          title: string;
          category: string;
          description: string;
          brand?: string | null;
          color?: string | null;
          identifying_marks?: string | null;
          location_found: string;
          date_found: string;
          image_url: string;
          image_storage_path?: string | null;
          safe_contact_method?: string;
          status?: string;
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          category?: string;
          description?: string;
          brand?: string | null;
          color?: string | null;
          identifying_marks?: string | null;
          location_found?: string;
          date_found?: string;
          image_url?: string;
          image_storage_path?: string | null;
          safe_contact_method?: string;
          status?: string;
          is_approved?: boolean;
          updated_at?: string;
        };
      };
      image_embeddings: {
        Row: {
          id: string;
          item_type: string;
          item_id: string;
          embedding: Json;
          dimension: number;
          model_name: string;
          model_version: string;
          image_hash: string | null;
          created_at: string;
        };
      };
      match_results: {
        Row: {
          id: string;
          lost_item_id: string;
          found_item_id: string;
          similarity_score: number;
          composite_score: number;
          ranking_details: Json | null;
          user_feedback: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      contact_requests: {
        Row: {
          id: string;
          lost_item_id: string | null;
          found_item_id: string;
          requester_id: string;
          recipient_id: string;
          message: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
      };
      messages: {
        Row: {
          id: string;
          contact_request_id: string;
          sender_id: string;
          content: string;
          is_read: boolean;
          created_at: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          link_url: string | null;
          is_read: boolean;
          created_at: string;
        };
      };
    };
  };
}
