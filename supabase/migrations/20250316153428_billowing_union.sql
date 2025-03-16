/*
  # Add collections and collection items tables

  1. New Tables
    - `collections`
      - `id` (uuid, primary key)
      - `name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `collection_items`
      - `id` (uuid, primary key)
      - `collection_id` (uuid, foreign key)
      - `shortcut_id` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
    - Add policies for authenticated users to manage collections
*/

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create collection_items table for many-to-many relationship
CREATE TABLE IF NOT EXISTS collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES collections(id) ON DELETE CASCADE,
  shortcut_id uuid REFERENCES shortcuts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(collection_id, shortcut_id)
);

-- Enable RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

-- Policies for collections
CREATE POLICY "Collections are viewable by everyone"
  ON collections
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage collections"
  ON collections
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for collection_items
CREATE POLICY "Collection items are viewable by everyone"
  ON collection_items
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage collection items"
  ON collection_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create some initial collections
INSERT INTO collections (name) VALUES
  ('Aircraft Systems'),
  ('Safety Equipment'),
  ('Airport Operations'),
  ('Crew Terminology')
ON CONFLICT DO NOTHING;

-- Add shortcuts to collections
WITH collections_data AS (
  SELECT id, name FROM collections
),
shortcuts_data AS (
  SELECT id, shortcut FROM shortcuts
)
INSERT INTO collection_items (collection_id, shortcut_id)
SELECT 
  c.id,
  s.id
FROM collections_data c
CROSS JOIN shortcuts_data s
WHERE 
  (c.name = 'Aircraft Systems' AND s.shortcut IN ('APU', 'ACARS', 'CIDS', 'CDLS', 'ISPSS', 'GPU')) OR
  (c.name = 'Safety Equipment' AND s.shortcut IN ('AED', 'BFK', 'ERK', 'FAK', 'MEK', 'PBE', 'SIC')) OR
  (c.name = 'Airport Operations' AND s.shortcut IN ('AMS', 'SPL', 'ATC', 'ETA', 'STA', 'STD')) OR
  (c.name = 'Crew Terminology' AND s.shortcut IN ('SCCM', 'CCM', 'F/O', 'PIC', 'CRM'))
ON CONFLICT DO NOTHING;