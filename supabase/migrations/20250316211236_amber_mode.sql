/*
  # Fix trigger function and permissions

  1. Changes
    - Update refresh function to return TRIGGER instead of VOID
    - Drop and recreate triggers with proper function
    - Grant necessary permissions
  
  2. Security
    - Makes refresh function more secure with SECURITY DEFINER
    - Ensures proper permissions for authenticated and anonymous users
*/

-- First drop the triggers that depend on the function
DROP TRIGGER IF EXISTS refresh_all_shortcuts_view_insert ON shortcuts;
DROP TRIGGER IF EXISTS refresh_all_shortcuts_view_update ON shortcuts;
DROP TRIGGER IF EXISTS refresh_all_shortcuts_view_delete ON shortcuts;

-- Now we can safely drop and recreate the function
DROP FUNCTION IF EXISTS refresh_all_shortcuts_view();

-- Recreate the function with SECURITY DEFINER and proper TRIGGER return type
CREATE OR REPLACE FUNCTION refresh_all_shortcuts_view()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY all_shortcuts_view;
  RETURN NULL;
END;
$$;

-- Recreate the triggers
CREATE TRIGGER refresh_all_shortcuts_view_insert
  AFTER INSERT ON shortcuts
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_all_shortcuts_view();

CREATE TRIGGER refresh_all_shortcuts_view_update
  AFTER UPDATE ON shortcuts
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_all_shortcuts_view();

CREATE TRIGGER refresh_all_shortcuts_view_delete
  AFTER DELETE ON shortcuts
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_all_shortcuts_view();

-- Grant usage on the schema to authenticated and anon users
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- Grant select permission to both authenticated and anon users
GRANT SELECT ON all_shortcuts_view TO authenticated, anon;

-- Grant execute permission on the refresh function to authenticated users
GRANT EXECUTE ON FUNCTION refresh_all_shortcuts_view() TO authenticated;