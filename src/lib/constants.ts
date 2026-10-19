import { ItemCategory } from '../types/item';
import { DemoPersona } from '../types/auth';
import { RankingWeights } from '../types/matching';

export const ITEM_CATEGORIES: ItemCategory[] = [
  'Electronics',
  'Bags',
  'Wallets',
  'Keys',
  'Documents',
  'Clothing',
  'Accessories',
  'Books',
  'ID Cards',
  'Other',
];

export const COMMON_CAMPUS_LOCATIONS = [
  'Main Library, 2nd Floor Study Commons',
  'Science Building, Room 302',
  'Athletic Pavilion, Court 1 Bleachers',
  'Student Union, Food Court Patio',
  'North Dining Commons, Information Desk',
  'Engineering Hall, Ground Floor Lounge',
  'University Bookstore, Checkout Counter',
  'Humanities Hall, Lecture Auditorium A',
  'Memorial Plaza Fountain Bench',
  'Biochemistry Lab, Prep Bench 4',
  'Campus Health Center, Waiting Room',
  'Campus Transit Shuttle Bus',
];

export const COMMON_COLORS = [
  'Black',
  'White',
  'Blue',
  'Navy',
  'Red',
  'Brown',
  'Gray',
  'Silver',
  'Green',
  'Gold',
  'Multicolor',
  'Other',
];

export const DEFAULT_RANKING_WEIGHTS: RankingWeights = {
  visual: 0.65,    // 65% weight on visual cosine similarity
  category: 0.15,  // 15% weight on exact category match
  location: 0.10,  // 10% weight on location proximity
  date: 0.10,      // 10% weight on temporal proximity
};

export const WEIGHT_PRESETS: Record<string, { label: string; description: string; weights: RankingWeights }> = {
  visualFocus: {
    label: 'Visual Dominant',
    description: 'Prioritizes photographic visual similarity (85% visual)',
    weights: { visual: 0.85, category: 0.05, location: 0.05, date: 0.05 },
  },
  balanced: {
    label: 'Balanced (Recommended)',
    description: 'Harmonizes image features with campus location & timeline',
    weights: { visual: 0.65, category: 0.15, location: 0.10, date: 0.10 },
  },
  strictMetadata: {
    label: 'Strict Category & Location',
    description: 'Prioritizes category and exact location alongside photo',
    weights: { visual: 0.40, category: 0.30, location: 0.20, date: 0.10 },
  },
};

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'sarah.chen@university.edu',
    fullName: 'Sarah Chen',
    role: 'user',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    description: 'Student who lost her black North Face backpack in Science Hall.',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'alex.rivera@university.edu',
    fullName: 'Alex Rivera',
    role: 'user',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    description: 'Good Samaritan student who found several items and turned them in.',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'admin.marcus@university.edu',
    fullName: 'Officer Marcus Vance',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    description: 'Campus Safety Administrator with moderation & resolution privileges.',
  },
];

// Presets for users to test "Report Lost Item" with 1-click in demo
export interface SampleReportPreset {
  id: string;
  name: string;
  category: ItemCategory;
  description: string;
  brand: string;
  color: string;
  identifyingMarks: string;
  locationLost: string;
  imageUrl: string;
  rewardAmount: number;
  expectedMatchTargetId: string;
}

export const SAMPLE_LOST_PRESETS: SampleReportPreset[] = [
  {
    id: 'sample-backpack',
    name: 'Black North Face Backpack',
    category: 'Bags',
    description: 'Lost my black Borealis school backpack during physics lecture in Science 302. Contains laptop and textbooks.',
    brand: 'The North Face',
    color: 'Black',
    identifyingMarks: 'Red paracord zipper cord attached to main zipper pull',
    locationLost: 'Science Building, Room 302',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    rewardAmount: 25,
    expectedMatchTargetId: 'a0000001-0000-0000-0000-000000000001',
  },
  {
    id: 'sample-waterbottle',
    name: 'Cobalt Blue Hydro Flask',
    category: 'Other',
    description: 'Left my wide mouth Hydro Flask water bottle on the bleachers after basketball practice.',
    brand: 'Hydro Flask',
    color: 'Cobalt Blue',
    identifyingMarks: 'Covered in outdoor and national park stickers, small bottom dent',
    locationLost: 'Athletic Pavilion, Court 1 Bleachers',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
    rewardAmount: 10,
    expectedMatchTargetId: 'a0000002-0000-0000-0000-000000000002',
  },
  {
    id: 'sample-airpods',
    name: 'AirPods Pro 2 in MagSafe Case',
    category: 'Electronics',
    description: 'Misplaced my Apple AirPods Pro case on the 2nd floor library study carrel near printer.',
    brand: 'Apple',
    color: 'White',
    identifyingMarks: 'Small hairline scratch across lid',
    locationLost: 'Main Library, 2nd Floor Study Commons',
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80',
    rewardAmount: 30,
    expectedMatchTargetId: 'a0000003-0000-0000-0000-000000000003',
  },
  {
    id: 'sample-keys',
    name: 'Honda Car Key with Red Carabiner',
    category: 'Keys',
    description: 'Dropped keychain while having lunch at the student union patio.',
    brand: 'Honda',
    color: 'Brass / Red',
    identifyingMarks: 'Red aluminum carabiner, Honda electronic key fob, mini bottle opener',
    locationLost: 'Student Union, Food Court Patio',
    imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80',
    rewardAmount: 20,
    expectedMatchTargetId: 'a0000006-0000-0000-0000-000000000006',
  },
  {
    id: 'sample-wallet',
    name: 'Brown Leather Bifold Wallet',
    category: 'Wallets',
    description: 'Left my brown leather wallet on checkout counter 3 while buying textbooks.',
    brand: 'Timberland',
    color: 'Dark Brown',
    identifyingMarks: 'White edge stitching, distressed brown leather',
    locationLost: 'University Bookstore, Checkout Counter',
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
    rewardAmount: 40,
    expectedMatchTargetId: 'a0000007-0000-0000-0000-000000000007',
  },
];
