-- ==============================================================================
-- LOSTANDFOUND AI - Supabase Database Migration
-- Version: 20261019000000_init_lost_and_found.sql
-- Description: Core schema, pgvector/embedding support, RLS policies, RPC functions
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- Attempt to enable pgvector if supported on the Supabase instance
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "vector";
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'pgvector extension could not be enabled; falling back to JSONB/FLOAT8[] embeddings';
END $$;

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    phone_obfuscated TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Lost Items Table
CREATE TABLE IF NOT EXISTS public.lost_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'Electronics', 'Bags', 'Wallets', 'Keys', 'Documents',
        'Clothing', 'Accessories', 'Books', 'ID Cards', 'Other'
    )),
    description TEXT NOT NULL,
    brand TEXT,
    color TEXT,
    identifying_marks TEXT,
    location_lost TEXT NOT NULL,
    date_lost DATE NOT NULL,
    time_lost TEXT,
    image_url TEXT NOT NULL,
    image_storage_path TEXT,
    reward_amount NUMERIC(10, 2) DEFAULT 0,
    contact_preference TEXT NOT NULL DEFAULT 'in_app' CHECK (contact_preference IN ('in_app', 'email_relay', 'finder_choice')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'match_found', 'contact_requested', 'resolved', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Found Items Table
CREATE TABLE IF NOT EXISTS public.found_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    finder_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'Electronics', 'Bags', 'Wallets', 'Keys', 'Documents',
        'Clothing', 'Accessories', 'Books', 'ID Cards', 'Other'
    )),
    description TEXT NOT NULL,
    brand TEXT,
    color TEXT,
    identifying_marks TEXT,
    location_found TEXT NOT NULL,
    date_found DATE NOT NULL,
    image_url TEXT NOT NULL,
    image_storage_path TEXT,
    safe_contact_method TEXT NOT NULL DEFAULT 'in_app' CHECK (safe_contact_method IN ('in_app', 'secure_dropoff', 'campus_security')),
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'resolved', 'handed_over')),
    is_approved BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Image Embeddings Table
CREATE TABLE IF NOT EXISTS public.image_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_type TEXT NOT NULL CHECK (item_type IN ('lost', 'found')),
    item_id UUID NOT NULL,
    embedding JSONB NOT NULL, -- Store normalized vector array [0.023, -0.412, ...]
    dimension INTEGER NOT NULL DEFAULT 512,
    model_name TEXT NOT NULL,
    model_version TEXT NOT NULL,
    image_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Match Results Table
CREATE TABLE IF NOT EXISTS public.match_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lost_item_id UUID NOT NULL REFERENCES public.lost_items(id) ON DELETE CASCADE,
    found_item_id UUID NOT NULL REFERENCES public.found_items(id) ON DELETE CASCADE,
    similarity_score DOUBLE PRECISION NOT NULL,
    composite_score DOUBLE PRECISION NOT NULL,
    ranking_details JSONB,
    user_feedback TEXT DEFAULT 'pending' CHECK (user_feedback IN ('pending', 'potential_match', 'not_a_match', 'contact_requested')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(lost_item_id, found_item_id)
);

-- 7. Contact Requests Table
CREATE TABLE IF NOT EXISTS public.contact_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lost_item_id UUID REFERENCES public.lost_items(id) ON DELETE SET NULL,
    found_item_id UUID NOT NULL REFERENCES public.found_items(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Messages (Safe In-App Communication)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_request_id UUID NOT NULL REFERENCES public.contact_requests(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('match_found', 'contact_request', 'message_received', 'item_resolved', 'admin_alert')),
    link_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Item Status History Audit Log
CREATE TABLE IF NOT EXISTS public.item_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_type TEXT NOT NULL CHECK (item_type IN ('lost', 'found')),
    item_id UUID NOT NULL,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    old_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_lost_items_category ON public.lost_items(category);
CREATE INDEX IF NOT EXISTS idx_lost_items_status ON public.lost_items(status);
CREATE INDEX IF NOT EXISTS idx_lost_items_user_id ON public.lost_items(user_id);
CREATE INDEX IF NOT EXISTS idx_lost_items_date_lost ON public.lost_items(date_lost DESC);

CREATE INDEX IF NOT EXISTS idx_found_items_category ON public.found_items(category);
CREATE INDEX IF NOT EXISTS idx_found_items_status ON public.found_items(status);
CREATE INDEX IF NOT EXISTS idx_found_items_finder_id ON public.found_items(finder_id);
CREATE INDEX IF NOT EXISTS idx_found_items_date_found ON public.found_items(date_found DESC);
CREATE INDEX IF NOT EXISTS idx_found_items_approved ON public.found_items(is_approved);

CREATE INDEX IF NOT EXISTS idx_image_embeddings_lookup ON public.image_embeddings(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_image_embeddings_hash ON public.image_embeddings(image_hash);

CREATE INDEX IF NOT EXISTS idx_match_results_lost ON public.match_results(lost_item_id);
CREATE INDEX IF NOT EXISTS idx_match_results_found ON public.match_results(found_item_id);
CREATE INDEX IF NOT EXISTS idx_match_results_scores ON public.match_results(composite_score DESC);

CREATE INDEX IF NOT EXISTS idx_contact_requests_users ON public.contact_requests(requester_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_contact_req ON public.messages(contact_request_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_status_history ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Public can view basic profile info, user can update their own
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Lost Items: Public can view non-closed lost items; owners & admins have full control
CREATE POLICY "Public can view active lost items"
    ON public.lost_items FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create lost items"
    ON public.lost_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lost items"
    ON public.lost_items FOR UPDATE
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete their own lost items"
    ON public.lost_items FOR DELETE
    USING (auth.uid() = user_id OR public.is_admin());

-- Found Items: Approved items are viewable by public; finder can update; admins can moderate
CREATE POLICY "Approved found items are viewable by everyone"
    ON public.found_items FOR SELECT
    USING (is_approved = true OR auth.uid() = finder_id OR public.is_admin());

CREATE POLICY "Authenticated users can create found items"
    ON public.found_items FOR INSERT
    WITH CHECK (auth.uid() = finder_id);

CREATE POLICY "Finders can update their own found items"
    ON public.found_items FOR UPDATE
    USING (auth.uid() = finder_id OR public.is_admin());

CREATE POLICY "Finders can delete their own found items"
    ON public.found_items FOR DELETE
    USING (auth.uid() = finder_id OR public.is_admin());

-- Image Embeddings: Public read for matching queries; system or owner can insert
CREATE POLICY "Embeddings are viewable by authenticated users"
    ON public.image_embeddings FOR SELECT
    USING (true);

CREATE POLICY "Embeddings can be created by authenticated users"
    ON public.image_embeddings FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Match Results: Viewable by the lost item owner or admins
CREATE POLICY "Users can view match results for their lost items"
    ON public.match_results FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.lost_items
            WHERE lost_items.id = match_results.lost_item_id
              AND (lost_items.user_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Users can insert or update match feedback"
    ON public.match_results FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.lost_items
            WHERE lost_items.id = match_results.lost_item_id
              AND (lost_items.user_id = auth.uid() OR public.is_admin())
        )
    );

-- Contact Requests: Only participants or admin can view and update
CREATE POLICY "Participants can view contact requests"
    ON public.contact_requests FOR SELECT
    USING (auth.uid() = requester_id OR auth.uid() = recipient_id OR public.is_admin());

CREATE POLICY "Users can create contact requests"
    ON public.contact_requests FOR INSERT
    WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Participants can update contact request status"
    ON public.contact_requests FOR UPDATE
    USING (auth.uid() = requester_id OR auth.uid() = recipient_id OR public.is_admin());

-- Messages: Only participants of the contact request can view and insert
CREATE POLICY "Participants can view conversation messages"
    ON public.messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.contact_requests cr
            WHERE cr.id = messages.contact_request_id
              AND (cr.requester_id = auth.uid() OR cr.recipient_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Participants can send messages"
    ON public.messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.contact_requests cr
            WHERE cr.id = messages.contact_request_id
              AND (cr.requester_id = auth.uid() OR cr.recipient_id = auth.uid())
        )
    );

-- Notifications: Only target user can view and update their own notifications
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Status History: Viewable by item owner or admin
CREATE POLICY "Status history viewable by item owners or admin"
    ON public.item_status_history FOR SELECT
    USING (
        auth.uid() = changed_by OR public.is_admin() OR
        EXISTS (SELECT 1 FROM public.lost_items WHERE id = item_id AND user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.found_items WHERE id = item_id AND finder_id = auth.uid())
    );

-- ==============================================================================
-- DATABASE TRIGGERS & RPC FUNCTIONS
-- ==============================================================================

-- Auto create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
        'user'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto update timestamp trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    new.updated_at = now();
    RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_timestamp BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_lost_items_timestamp BEFORE UPDATE ON public.lost_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_found_items_timestamp BEFORE UPDATE ON public.found_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_match_results_timestamp BEFORE UPDATE ON public.match_results FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_contact_requests_timestamp BEFORE UPDATE ON public.contact_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RPC Function: Dot Product Cosine Similarity search over found_items embeddings
CREATE OR REPLACE FUNCTION public.match_found_items(
    query_embedding JSONB,
    match_threshold FLOAT DEFAULT 0.50,
    max_results INT DEFAULT 20
)
RETURNS TABLE (
    found_item_id UUID,
    similarity_score FLOAT,
    title TEXT,
    category TEXT,
    description TEXT,
    brand TEXT,
    color TEXT,
    location_found TEXT,
    date_found DATE,
    image_url TEXT,
    status TEXT
) AS $$
DECLARE
    q_len INT;
BEGIN
    q_len := jsonb_array_length(query_embedding);

    RETURN QUERY
    WITH candidate_scores AS (
        SELECT
            fi.id AS f_id,
            fi.title AS f_title,
            fi.category AS f_category,
            fi.description AS f_desc,
            fi.brand AS f_brand,
            fi.color AS f_color,
            fi.location_found AS f_location,
            fi.date_found AS f_date,
            fi.image_url AS f_image,
            fi.status AS f_status,
            (
                SELECT COALESCE(SUM((u.val)::float * (v.val)::float), 0.0)
                FROM jsonb_array_elements_text(query_embedding) WITH ORDINALITY AS u(val, idx)
                JOIN jsonb_array_elements_text(ie.embedding) WITH ORDINALITY AS v(val, idx)
                  ON u.idx = v.idx
            ) AS sim
        FROM public.found_items fi
        JOIN public.image_embeddings ie ON ie.item_id = fi.id AND ie.item_type = 'found'
        WHERE fi.is_approved = true AND fi.status = 'available'
    )
    SELECT
        f_id,
        sim,
        f_title,
        f_category,
        f_desc,
        f_brand,
        f_color,
        f_location,
        f_date,
        f_image,
        f_status
    FROM candidate_scores
    WHERE sim >= match_threshold
    ORDER BY sim DESC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
