/*
# NFC Restaurant Menu — Schema + Seed Data

1. Purpose
   Stores restaurant branding settings, menu sections, and individual menu items
   for a mobile-first NFC-tap restaurant menu app. No user accounts required —
   this is a single-tenant public schema. The admin portal is password-protected
   on the frontend, so data is readable and writable by the anon role.

2. New Tables
   - `restaurant_settings`: singleton row with branding (logo, colors, background, fonts, admin password).
     - id (int, pk, default 1)
     - name (text)
     - tagline (text)
     - logo_url (text)
     - bg_type (text: 'color' | 'gradient' | 'image')
     - bg_value (text)
     - bg_image_url (text)
     - primary_color (text)
     - secondary_color (text)
     - accent_color (text)
     - neutral_color (text)
     - heading_font (text)
     - body_font (text)
     - hero_image_url (text)
     - admin_password (text)
     - updated_at (timestamptz)

   - `menu_sections`: ordered list of menu categories.
     - id (uuid, pk)
     - name (text)
     - icon (text — lucide icon name)
     - sort_order (int)
     - created_at (timestamptz)

   - `menu_items`: dishes belonging to a section.
     - id (uuid, pk)
     - section_id (uuid, fk → menu_sections.id ON DELETE CASCADE)
     - name (text)
     - description (text)
     - price (numeric(10,2))
     - image_url (text)
     - is_available (boolean, default true)
     - sort_order (int)
     - created_at (timestamptz)

3. Security
   - RLS enabled on all three tables.
   - Anon + authenticated can SELECT, INSERT, UPDATE, DELETE (intentionally public
     single-tenant app; admin password gate is enforced in the frontend).

4. Notes
   - Seed data inserts a default restaurant_settings row (id=1), four sections
     (Starters, Mains, Desserts, Drinks), and 12 sample items with image URLs.
*/

-- ── restaurant_settings ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS restaurant_settings (
  id            integer PRIMARY KEY DEFAULT 1,
  name          text    NOT NULL DEFAULT 'Bella Tavola',
  tagline       text    NOT NULL DEFAULT 'Cucina Italiana',
  logo_url      text,
  bg_type       text    NOT NULL DEFAULT 'gradient',
  bg_value      text    NOT NULL DEFAULT 'linear-gradient(160deg, #1a1410 0%, #2d2018 50%, #1a1410 100%)',
  bg_image_url  text,
  primary_color text    NOT NULL DEFAULT '#c9954b',
  secondary_color text  NOT NULL DEFAULT '#e8c88a',
  accent_color  text    NOT NULL DEFAULT '#d4502a',
  neutral_color text    NOT NULL DEFAULT '#f5f0e8',
  heading_font  text    NOT NULL DEFAULT 'Playfair Display',
  body_font     text    NOT NULL DEFAULT 'Inter',
  hero_image_url text,
  admin_password text   NOT NULL DEFAULT 'admin123',
  updated_at    timestamptz DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE restaurant_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_settings" ON restaurant_settings;
CREATE POLICY "anon_select_settings" ON restaurant_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_settings" ON restaurant_settings;
CREATE POLICY "anon_insert_settings" ON restaurant_settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_settings" ON restaurant_settings;
CREATE POLICY "anon_update_settings" ON restaurant_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_settings" ON restaurant_settings;
CREATE POLICY "anon_delete_settings" ON restaurant_settings FOR DELETE
  TO anon, authenticated USING (true);

-- ── menu_sections ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_sections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  icon        text NOT NULL DEFAULT 'UtensilsCrossed',
  sort_order  int  NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE menu_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_sections" ON menu_sections;
CREATE POLICY "anon_select_sections" ON menu_sections FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sections" ON menu_sections;
CREATE POLICY "anon_insert_sections" ON menu_sections FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sections" ON menu_sections;
CREATE POLICY "anon_update_sections" ON menu_sections FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sections" ON menu_sections;
CREATE POLICY "anon_delete_sections" ON menu_sections FOR DELETE
  TO anon, authenticated USING (true);

-- ── menu_items ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id   uuid NOT NULL REFERENCES menu_sections(id) ON DELETE CASCADE,
  name         text NOT NULL,
  description  text NOT NULL DEFAULT '',
  price        numeric(10,2) NOT NULL DEFAULT 0,
  image_url    text NOT NULL DEFAULT '',
  is_available boolean NOT NULL DEFAULT true,
  sort_order   int  NOT NULL DEFAULT 0,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_items" ON menu_items;
CREATE POLICY "anon_select_items" ON menu_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_items" ON menu_items;
CREATE POLICY "anon_insert_items" ON menu_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_items" ON menu_items;
CREATE POLICY "anon_update_items" ON menu_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_items" ON menu_items;
CREATE POLICY "anon_delete_items" ON menu_items FOR DELETE
  TO anon, authenticated USING (true);

-- ── Seed: restaurant_settings ────────────────────────────────
INSERT INTO restaurant_settings (id, name, tagline, hero_image_url)
VALUES (1, 'Bella Tavola', 'Cucina Italiana', 'https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=1200')
ON CONFLICT (id) DO NOTHING;

-- ── Seed: menu_sections ──────────────────────────────────────
INSERT INTO menu_sections (name, icon, sort_order) VALUES
('Starters', 'Salad', 0),
('Mains',    'Beef', 1),
('Desserts', 'Cake', 2),
('Drinks',   'Wine', 3)
ON CONFLICT DO NOTHING;

-- ── Seed: menu_items ─────────────────────────────────────────
-- Use fixed section ids via sub-select on name
INSERT INTO menu_items (section_id, name, description, price, image_url, sort_order)
SELECT s.id, v.name, v.description, v.price, v.image_url, v.sort_order
FROM menu_sections s
JOIN (VALUES
  ('Starters', 'Burrata Caprese', 'Fresh burrata, heirloom tomatoes, basil oil, aged balsamic', 14.00,
   'https://images.pexels.com/photos/14420464/pexels-photo-14420464.jpeg?auto=compress&cs=tinysrgb&w=800', 0),
  ('Starters', 'Truffle Arancini', 'Saffron risotto balls with black truffle and parmesan aioli', 12.00,
   'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 1),
  ('Starters', 'Seared Scallops', 'Pan-seared diver scallops, cauliflower puree, brown butter', 18.00,
   'https://images.pexels.com/photos/2871757/pexels-photo-2871757.jpeg?auto=compress&cs=tinysrgb&w=800', 2),
  ('Mains', 'Tagliatelle al Tartufo', 'Hand-cut tagliatelle, black truffle, parmesan, brown butter', 26.00,
   'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 0),
  ('Mains', 'Branzino al Forno', 'Whole roasted Mediterranean sea bass, lemon, herbs, olive oil', 32.00,
   'https://images.pexels.com/photos/263119/pexels-photo-263119.jpeg?auto=compress&cs=tinysrgb&w=800', 1),
  ('Mains', 'Bistecca Fiorentina', 'Dry-aged T-bone, rosemary, sea salt, roasted garlic', 42.00,
   'https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg?auto=compress&cs=tinysrgb&w=800', 2),
  ('Mains', 'Risotto ai Funghi', 'Carnaroli rice, wild mushrooms, truffle, parmesan', 24.00,
   'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=800', 3),
  ('Desserts', 'Tiramisu', 'Espresso-soaked ladyfingers, mascarpone, cocoa', 9.00,
   'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg?auto=compress&cs=tinysrgb&w=800', 0),
  ('Desserts', 'Panna Cotta', 'Vanilla bean cream, berry compote, mint', 8.00,
   'https://images.pexels.com/photos/3768942/pexels-photo-3768942.jpeg?auto=compress&cs=tinysrgb&w=800', 1),
  ('Desserts', 'Cannoli Siciliani', 'Crisp shells, sweet ricotta, pistachio, chocolate chips', 10.00,
   'https://images.pexels.com/photos/4109136/pexels-photo-4109136.jpeg?auto=compress&cs=tinysrgb&w=800', 2),
  ('Drinks', 'Negroni', 'Gin, Campari, sweet vermouth, orange peel', 12.00,
   'https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg?auto=compress&cs=tinysrgb&w=800', 0),
  ('Drinks', 'Aperol Spritz', 'Aperol, prosecco, soda, orange', 10.00,
   'https://images.pexels.com/photos/5868013/pexels-photo-5868013.jpeg?auto=compress&cs=tinysrgb&w=800', 1)
) AS v(section, name, description, price, image_url, sort_order)
ON v.section = s.name
ON CONFLICT DO NOTHING;

-- index for common query
CREATE INDEX IF NOT EXISTS idx_menu_items_section ON menu_items(section_id);
CREATE INDEX IF NOT EXISTS idx_menu_sections_order ON menu_sections(sort_order);
