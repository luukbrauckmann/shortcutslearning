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

-- First, calculate the number of chapters needed and create them
DO $$
DECLARE
    total_shortcuts INTEGER;
    num_chapters INTEGER;
    i INTEGER;
    new_collection_id uuid;
BEGIN
    -- Get total number of shortcuts
    SELECT COUNT(*) INTO total_shortcuts FROM shortcuts;
    num_chapters := CEIL(total_shortcuts::float / 20);
    
    -- Create chapter collections
    FOR i IN 1..num_chapters LOOP
        -- Insert new chapter and get its ID
        INSERT INTO collections (name)
        SELECT 'Chapter ' || i
        WHERE NOT EXISTS (
            SELECT 1 FROM collections WHERE name = 'Chapter ' || i
        )
        RETURNING id INTO new_collection_id;
        
        -- If chapter was created (new_collection_id is not null),
        -- insert shortcuts for this chapter
        IF new_collection_id IS NOT NULL THEN
            INSERT INTO collection_items (collection_id, shortcut_id)
            SELECT 
                new_collection_id,
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
        END IF;
    END LOOP;
END $$;