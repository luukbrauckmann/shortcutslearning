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

-- First, calculate the number of chapters needed
DO $$
DECLARE
    total_shortcuts INTEGER;
    num_chapters INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_shortcuts FROM shortcuts;
    num_chapters := CEIL(total_shortcuts::float / 20);
    
    -- Create chapter collections
    FOR i IN 1..num_chapters LOOP
        INSERT INTO collections (name)
        VALUES ('Chapter ' || i)
        ON CONFLICT (name) DO NOTHING;
    END LOOP;
END $$;

-- Create a function to assign shortcuts to chapters
CREATE OR REPLACE FUNCTION assign_shortcuts_to_chapters() RETURNS void AS $$
DECLARE
    shortcut_record RECORD;
    chapter_id uuid;
    counter INTEGER := 0;
    current_chapter INTEGER := 1;
BEGIN
    FOR shortcut_record IN (
        SELECT id 
        FROM shortcuts 
        ORDER BY shortcut
    ) LOOP
        -- Get the current chapter id
        SELECT id INTO chapter_id 
        FROM collections 
        WHERE name = 'Chapter ' || current_chapter;
        
        -- Insert the shortcut into the current chapter
        INSERT INTO collection_items (collection_id, shortcut_id)
        VALUES (chapter_id, shortcut_record.id)
        ON CONFLICT (collection_id, shortcut_id) DO NOTHING;
        
        -- Increment counter and check if we need to move to next chapter
        counter := counter + 1;
        IF counter >= 20 THEN
            counter := 0;
            current_chapter := current_chapter + 1;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to assign shortcuts
SELECT assign_shortcuts_to_chapters();

-- Clean up the function as it's no longer needed
DROP FUNCTION assign_shortcuts_to_chapters();