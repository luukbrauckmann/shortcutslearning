/*
  # Add Chapter Collections

  1. Changes
    - Create chapter collections (Chapter 1, Chapter 2, etc.)
    - Distribute existing shortcuts across chapters (20 per chapter)
    - Maintain alphabetical order within chapters

  2. Notes
    - Each chapter contains approximately 20 shortcuts
    - Shortcuts are distributed alphabetically
    - Preserves existing collections
*/

-- Create chapter collections
WITH chapter_data AS (
  SELECT 
    'Chapter ' || chapter_num AS name,
    chapter_num
  FROM generate_series(1, (SELECT CEIL(COUNT(*)::float / 20) FROM shortcuts)) AS chapter_num
)
INSERT INTO collections (name)
SELECT name FROM chapter_data
ON CONFLICT (name) DO NOTHING;

-- Create a temporary table to help with chapter assignment
CREATE TEMPORARY TABLE shortcut_chapters AS
SELECT 
  s.id AS shortcut_id,
  c.id AS collection_id,
  ROW_NUMBER() OVER (ORDER BY s.shortcut) AS rn
FROM shortcuts s
CROSS JOIN (
  SELECT id, name,
    ROW_NUMBER() OVER (ORDER BY name) AS chapter_num
  FROM collections 
  WHERE name LIKE 'Chapter %'
) c
WHERE CEIL(ROW_NUMBER() OVER (ORDER BY s.shortcut)::float / 20) = c.chapter_num;

-- Insert shortcuts into chapters
INSERT INTO collection_items (collection_id, shortcut_id)
SELECT collection_id, shortcut_id
FROM shortcut_chapters
ON CONFLICT (collection_id, shortcut_id) DO NOTHING;

-- Clean up
DROP TABLE shortcut_chapters;