/*
  # Restructure database to use chapters instead of collections

  1. Changes
    - Drop existing collections and collection_items tables
    - Create new chapters table
    - Create new chapter_items table for chapter-shortcut relationships
    - Create view for all shortcuts
    - Add RLS policies for chapters

  2. Notes
    - Preserves all shortcuts
    - Creates new chapter structure
    - Maintains security policies
*/

-- Drop existing tables and views
DROP VIEW IF EXISTS all_shortcuts_collection;
DROP TABLE IF EXISTS collection_items;
DROP TABLE IF EXISTS collections;

-- Create chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chapter_items table for many-to-many relationship
CREATE TABLE IF NOT EXISTS chapter_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid REFERENCES chapters(id) ON DELETE CASCADE,
  shortcut_id uuid REFERENCES shortcuts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(chapter_id, shortcut_id)
);

-- Enable RLS
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_items ENABLE ROW LEVEL SECURITY;

-- Policies for chapters
CREATE POLICY "Chapters are viewable by everyone"
  ON chapters
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage chapters"
  ON chapters
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for chapter_items
CREATE POLICY "Chapter items are viewable by everyone"
  ON chapter_items
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage chapter items"
  ON chapter_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create chapters and distribute shortcuts
DO $$
DECLARE
    total_shortcuts INTEGER;
    num_chapters INTEGER;
    i INTEGER;
    new_chapter_id uuid;
BEGIN
    -- Get total number of shortcuts
    SELECT COUNT(*) INTO total_shortcuts FROM shortcuts;
    num_chapters := CEIL(total_shortcuts::float / 20);
    
    -- Create chapters
    FOR i IN 1..num_chapters LOOP
        -- Insert new chapter and get its ID
        INSERT INTO chapters (name)
        VALUES ('Chapter ' || i)
        RETURNING id INTO new_chapter_id;
        
        -- Insert shortcuts for this chapter
        INSERT INTO chapter_items (chapter_id, shortcut_id)
        SELECT 
            new_chapter_id,
            id AS shortcut_id
        FROM (
            SELECT 
                id,
                ROW_NUMBER() OVER (ORDER BY shortcut) AS rn
            FROM shortcuts
        ) numbered_shortcuts
        WHERE 
            rn > ((i-1) * 20) 
            AND rn <= (i * 20);
    END LOOP;
END $$;

-- Create view for all shortcuts
CREATE OR REPLACE VIEW all_shortcuts_view AS
SELECT 
  'all' as chapter_id,
  'All Shortcuts' as chapter_name,
  s.id as shortcut_id,
  s.shortcut,
  s.meaning,
  s.created_at
FROM shortcuts s;