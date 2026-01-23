import { Timestamp } from 'firebase/firestore';

export interface Painting {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  tags: string[];
  featured: boolean;
  tag_prices?: Record<string, number>;
  created_at: Timestamp | string;
  updated_at: Timestamp | string;
}

export interface Book {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  gallery_images?: string[];
  price: number | null;
  featured: boolean;
  publisher_available: boolean;
  publisher_link: string | null;
  publisher_in_stock: boolean;
  website_cart_available: boolean;
  created_at: Timestamp | string;
  updated_at: Timestamp | string;
}

export interface MerchandiseImage {
  id: string;
  merchandise_id: string;
  image_url: string;
  is_main: boolean;
  display_order: number;
  created_at: Timestamp | string;
}

export interface Merchandise {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  in_stock: boolean;
  inventory_count: number | null;
  featured: boolean;
  primary_image?: string | null;
  secondary_images?: string[];
  available_sizes?: string[];
  available_colors?: string[];
  created_at: Timestamp | string;
  updated_at: Timestamp | string;
  merchandise_images?: MerchandiseImage[];
}

export interface Mural {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  location: string | null;
  year: number | null;
  created_at: Timestamp | string;
  updated_at: Timestamp | string;
}

export interface Character {
  id: string;
  name: string;
  description: string | null;
  bio: string | null;
  artist_notes: string | null;
  image_url: string | null;
  character_type: 'cryptid' | 'pebblewick';
  status: 'current' | 'upcoming';
  has_video_story: boolean;
  youtube_url: string | null;
  printful_store_url: string | null;
  created_at: Timestamp | string;
  updated_at: Timestamp | string;
}

export interface Tag {
  id: string;
  name: string;
  created_at: Timestamp | string;
}

export type TagOption = {
  value: string;
  label: string;
};

export interface CartItem {
  id: string;
  title: string;
  description?: string | null;
  price: number | null;
  image_url: string;
  type: 'painting' | 'book' | 'merchandise';
  quantity: number;
  variant?: string;
  size?: string;
  color?: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
  created_at: Timestamp | string;
  updated_at: Timestamp | string;
}

export interface AbandonedCart {
  id: string;
  user_id?: string;
  session_id?: string;
  cart_items: CartItem[];
  total_price: number;
  is_converted: boolean;
  user_email?: string;
  user_name?: string;
  created_at: Timestamp | string;
  updated_at: Timestamp | string;
  last_activity?: Timestamp | string;
}

export interface Purchase {
  id: string;
  user_id?: string;
  customer_email: string;
  product_id: string;
  product_type: 'painting' | 'book' | 'merchandise';
  product_title: string;
  amount: number;
  quantity: number;
  status: string;
  payment_id?: string;
  stripe_session_id?: string;
  metadata?: Record<string, any>;
  created_at: Timestamp | string;
  updated_at: Timestamp | string;
}

export interface Commission {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  type: string;
  size: string;
  budget: string;
  deadline: string;
  contact_email: string;
  contact_name: string | null;
  contact_phone?: string | null;
  contact_address_line1?: string | null;
  contact_address_line2?: string | null;
  contact_city?: string | null;
  contact_state?: string | null;
  contact_postal_code?: string | null;
  contact_country?: string | null;
  contact_preferred_method?: string | null;
  contact_best_time?: string | null;
  status: 'Not Started' | 'In Progress' | 'Review' | 'Completed' | 'Cancelled';
  payment_status: 'Unpaid' | 'Partial' | 'Paid';
  total_price: number;
  amount_paid: number;
  created_at: Timestamp | string;
  updated_at: Timestamp | string;
}

export interface CustomerAddress {
  id: string;
  user_id: string;
  label?: string | null;
  recipient_name?: string | null;
  phone?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default?: boolean;
  source?: 'manual' | 'commission';
  commission_id?: string | null;
  created_at: Timestamp | string;
  updated_at: Timestamp | string;
}

export interface Message {
  id: string;
  commission_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: Timestamp | string;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: Timestamp | string;
}

export interface ArtistProfile {
  id: string;
  name: string;
  bio: string | null;
  profile_image_url: string | null;
  created_at: Timestamp | string;
  updated_at: Timestamp | string;
}

export interface DashboardSummary {
  total_commissions: number;
  unpaid_commissions: number;
  pending_contracts: number;
  unread_messages: number;
}
