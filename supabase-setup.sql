-- ============================================================
-- CELEBRIA — Supabase setup
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1) Templates table
-- Note: column is named "description" (not "desc") because DESC is reserved in SQL.
-- The app maps description ↔ desc automatically.

CREATE TABLE IF NOT EXISTS public.templates (
  id          text PRIMARY KEY,
  title       text NOT NULL,
  category    text NOT NULL CHECK (category IN ('Classic', 'Golden', 'VIP')),
  event_type  text NOT NULL CHECK (event_type IN (
                'Wedding', 'Engagement', 'Katb Ktab', 'Birthday',
                'Suboo', 'Graduation', 'Event'
              )),
  price       text,
  description text,
  thumb       text,
  demo        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Helpful index for listing
CREATE INDEX IF NOT EXISTS templates_created_at_idx
  ON public.templates (created_at);

-- 2) Row Level Security
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Drop old policies if re-running this script
DROP POLICY IF EXISTS "Public read templates" ON public.templates;
DROP POLICY IF EXISTS "Public insert templates" ON public.templates;
DROP POLICY IF EXISTS "Public update templates" ON public.templates;
DROP POLICY IF EXISTS "Public delete templates" ON public.templates;

-- Anyone can read (needed for the public landing page)
CREATE POLICY "Public read templates"
  ON public.templates
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Anyone with the anon key can write.
-- WARNING: This is intentional for a static site with only a client-side
-- admin password. Anyone who has your anon key (visible in the browser)
-- can modify rows. For stronger security, add Supabase Auth later and
-- restrict these policies to authenticated users only.
CREATE POLICY "Public insert templates"
  ON public.templates
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public update templates"
  ON public.templates
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete templates"
  ON public.templates
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- 3) Optional: seed starter catalog (skip if you prefer Admin → Seed)
INSERT INTO public.templates (id, title, category, event_type, price, description, thumb, demo)
VALUES
  ('t1',  'Royal Swan',       'VIP',     'Wedding',     '$189', 'Elegant swans & gold foil animation with cinematic envelope reveal.', '', 'https://demo.celebria.com/royal-swan'),
  ('t2',  'Minimalist Pearl', 'Classic', 'Engagement',  '$129', 'Clean typography, soft pearl tones, and refined motion design.', '', 'https://demo.celebria.com/minimalist-pearl'),
  ('t3',  'Golden Blossom',   'Golden',  'Wedding',     '$159', 'Blooming florals with interactive photo timeline and soft music.', '', 'https://demo.celebria.com/golden-blossom'),
  ('t4',  'Midnight Velvet',  'VIP',     'Katb Ktab',   '$169', 'Deep tones, gold accents, and dramatic countdown experience.', '', 'https://demo.celebria.com/midnight-velvet'),
  ('t5',  'Ivory Classic',    'Classic', 'Wedding',     '$149', 'Timeless script, soft cream palette, and traditional elegance.', '', 'https://demo.celebria.com/ivory-classic'),
  ('t6',  'Desert Rose',      'Golden',  'Engagement',  '$139', 'Warm earth tones, dried florals, and free-spirited storytelling.', '', 'https://demo.celebria.com/desert-rose'),
  ('t7',  'Celestial Garden', 'VIP',     'Birthday',    '$199', 'Starry night sky, constellation map, and glowing envelope animation.', '', 'https://demo.celebria.com/celestial-garden'),
  ('t8',  'Silk & Stone',     'Classic', 'Graduation',  '$154', 'Architectural lines, stone textures, and understated luxury.', '', 'https://demo.celebria.com/silk-stone'),
  ('t9',  'Little Star',      'Golden',  'Suboo',       '$119', 'Soft pastels and playful animations perfect for a baby’s Suboo.', '', 'https://demo.celebria.com/little-star'),
  ('t10', 'Corporate Luxe',   'VIP',     'Event',       '$179', 'Sleek branding-ready invitation for galas and corporate events.', '', 'https://demo.celebria.com/corporate-luxe')
ON CONFLICT (id) DO NOTHING;
