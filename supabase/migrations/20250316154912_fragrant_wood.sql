/*
  # Add All Shortcuts View

  1. New View
    - `all_shortcuts_collection`
      - Virtual collection that shows all shortcuts
      - Helps query all shortcuts as if they were in a collection

  2. Notes
    - Creates a view to simulate a collection containing all shortcuts
    - Safe to run multiple times
*/

-- Create a view for all shortcuts
CREATE OR REPLACE VIEW all_shortcuts_collection AS
SELECT 
  'all' as collection_id,
  'All Shortcuts' as collection_name,
  s.id as shortcut_id,
  s.shortcut,
  s.meaning,
  s.created_at
FROM shortcuts s;

-- Grant access to the view
GRANT SELECT ON all_shortcuts_collection TO public;
GRANT SELECT ON all_shortcuts_collection TO authenticated;