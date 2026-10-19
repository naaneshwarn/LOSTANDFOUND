-- ==============================================================================
-- LOSTANDFOUND AI - Seed Data for PostgreSQL
-- Sample items representing real-world college campus lost and found cases
-- ==============================================================================

-- 1. Create Demo Profiles
INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'sarah.chen@university.edu', 'Sarah Chen', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'user'),
    ('22222222-2222-2222-2222-222222222222', 'alex.rivera@university.edu', 'Alex Rivera', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'user'),
    ('33333333-3333-3333-3333-333333333333', 'admin.marcus@university.edu', 'Campus Safety Officer Marcus', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'admin')
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Found Items (Discovered items waiting to be claimed)
INSERT INTO public.found_items (
    id, finder_id, title, category, description, brand, color, identifying_marks, location_found, date_found, image_url, safe_contact_method, status, is_approved
) VALUES
(
    'a0000001-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222222',
    'Black North Face Backpack',
    'Bags',
    'Black Borealis nylon backpack found under desk in Science Building Room 302. Contains notebooks and pens. Has a red paracord zipper pull on main compartment.',
    'The North Face',
    'Black',
    'Red paracord zipper pull, slight fray on right strap',
    'Science Building, Room 302',
    CURRENT_DATE - INTERVAL '2 days',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    'in_app',
    'available',
    true
),
(
    'a0000002-0000-0000-0000-000000000002',
    '22222222-2222-2222-2222-222222222222',
    'Hydro Flask 32oz Blue Water Bottle',
    'Other',
    'Cobalt blue wide-mouth stainless steel water bottle left on the bleachers near the basketball court. Covered with outdoor adventure stickers.',
    'Hydro Flask',
    'Cobalt Blue',
    'Yosemite and REI stickers, dent on bottom rim',
    'Athletic Pavilion, Court 1 Bleachers',
    CURRENT_DATE - INTERVAL '1 day',
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
    'in_app',
    'available',
    true
),
(
    'a0000003-0000-0000-0000-000000000003',
    '22222222-2222-2222-2222-222222222222',
    'Apple AirPods Pro 2 in MagSafe Case',
    'Electronics',
    'White AirPods Pro second generation with charging case. Found on the 2nd floor library study carrel next to printer station.',
    'Apple',
    'White',
    'Small superficial scratch across top lid of case',
    'Main Library, 2nd Floor Study Commons',
    CURRENT_DATE - INTERVAL '3 days',
    'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80',
    'in_app',
    'available',
    true
),
(
    'a0000004-0000-0000-0000-000000000004',
    '33333333-3333-3333-3333-333333333333',
    'University Student ID Card & Lanyard',
    'ID Cards',
    'Blue university lanyard with magnetic swipe student card. Handed into security desk at dining hall. Name partially concealed for privacy.',
    'Campus Card Services',
    'Blue / White',
    'Navy ribbon lanyard with silver bulldog clip',
    'North Dining Commons, Information Desk',
    CURRENT_DATE - INTERVAL '1 day',
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
    'in_app',
    'available',
    true
),
(
    'a0000005-0000-0000-0000-000000000005',
    '22222222-2222-2222-2222-222222222222',
    'Apple 67W USB-C Power Adapter & Cable',
    'Electronics',
    'White MacBook charging brick with 2-meter braided USB-C cable left plugged into wall outlet.',
    'Apple',
    'White',
    'Braided cord, initials "J.T." faintly marked on plug edge',
    'Engineering Hall, Ground Floor Lounge',
    CURRENT_DATE - INTERVAL '4 days',
    'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
    'in_app',
    'available',
    true
),
(
    'a0000006-0000-0000-0000-000000000006',
    '33333333-3333-3333-3333-333333333333',
    'Brass Keychain with Honda Fob & Red Carabiner',
    'Keys',
    'Set of 4 keys including a Honda electronic fob, bronze house key, and miniature bottle opener on an anodized red aluminum carabiner.',
    'Honda / Yale',
    'Brass / Red',
    'Red carabiner, miniature bicycle bottle opener',
    'Student Union, Food Court Patio',
    CURRENT_DATE - INTERVAL '2 days',
    'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80',
    'in_app',
    'available',
    true
),
(
    'a0000007-0000-0000-0000-000000000007',
    '22222222-2222-2222-2222-222222222222',
    'Brown Leather Bifold Wallet',
    'Wallets',
    'Genuine brown leather wallet with contrast stitching along borders. Cash and personal cards secured safely with campus security.',
    'Bellroy / Timberland',
    'Dark Brown',
    'Contrast white stitching, distressed leather patina',
    'University Bookstore, Checkout Counter 3',
    CURRENT_DATE - INTERVAL '1 day',
    'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
    'in_app',
    'available',
    true
),
(
    'a0000008-0000-0000-0000-000000000008',
    '33333333-3333-3333-3333-333333333333',
    'Ray-Ban Wayfarer Classic Sunglasses',
    'Accessories',
    'Black frame Wayfarer sunglasses with green classic G-15 lenses. Found inside black textured leather protective case.',
    'Ray-Ban',
    'Black / Dark Green',
    'Gold logo stamp on outer temple, black button snap case',
    'Humanities Hall, Lecture Auditorium A',
    CURRENT_DATE - INTERVAL '3 days',
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80',
    'in_app',
    'available',
    true
),
(
    'a0000009-0000-0000-0000-000000000009',
    '22222222-2222-2222-2222-222222222222',
    'Patagonia Down Sweater Jacket (Size M)',
    'Clothing',
    'Men''s black quilted puffer jacket draped over the back of a bench near the campus fountain.',
    'Patagonia',
    'Black',
    'Fitz Roy logo patch on left chest, inner zippered chest pocket',
    'Memorial Plaza Fountain Bench',
    CURRENT_DATE - INTERVAL '5 days',
    'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
    'in_app',
    'available',
    true
),
(
    'a0000010-0000-0000-0000-00000000010',
    '33333333-3333-3333-3333-333333333333',
    'Organic Chemistry Hardcover 8th Edition',
    'Books',
    'Hardcover college textbook by Vollhardt and Schore with colorful molecular orbitals on cover. Contains sticky notes on chapter 12.',
    'W.H. Freeman',
    'Navy / Multicolored',
    'Post-it notes on aromaticity section, highlighted in yellow',
    'Biochemistry Lab, Prep Bench 4',
    CURRENT_DATE - INTERVAL '2 days',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    'in_app',
    'available',
    true
);

-- 3. Seed Sample Lost Item (Reported by Sarah Chen)
INSERT INTO public.lost_items (
    id, user_id, title, category, description, brand, color, identifying_marks, location_lost, date_lost, time_lost, image_url, reward_amount, contact_preference, status
) VALUES (
    'b0000001-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Black The North Face Backpack',
    'Bags',
    'Lost my North Face school backpack during or after my afternoon physics lecture. Has all my class notes and a red zipper pull!',
    'The North Face',
    'Black',
    'Red paracord zipper cord attached to main zipper',
    'Science Building, Room 302 or hallway',
    CURRENT_DATE - INTERVAL '2 days',
    '2:30 PM',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    25.00,
    'in_app',
    'match_found'
);
