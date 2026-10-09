export interface RestaurantSettings {
  id: number;
  name: string;
  tagline: string;
  logo_url: string | null;
  bg_type: string;
  bg_value: string;
  bg_image_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  neutral_color: string;
  heading_font: string;
  body_font: string;
  hero_image_url: string | null;
  admin_password: string;
  updated_at: string;
}

export interface MenuSection {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  created_at: string;
}

export interface MenuItem {
  id: string;
  section_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
  sort_order: number;
  created_at: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export type BgType = 'color' | 'gradient' | 'image';
