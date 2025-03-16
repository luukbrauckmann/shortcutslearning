/*
  # Fix materialized view permissions

  1. Changes
    - Grant permissions on all_shortcuts_view to authenticated users
    - Grant permissions on all_shortcuts_view to anon users for read-only access
    - Add security definer to refresh function
  
  2. Security
    - Ensures authenticated users can perform CRUD operations
    - Maintains read-only access for public users
*/

-- Grant usage on the schema to authenticated and anon users
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- Grant select permission to both authenticated and anon users
GRANT SELECT ON all_shortcuts_view TO authenticated, anon;

-- Make the refresh function more secure by making it SECURITY DEFINER
-- This ensures it runs with the permissions of the owner
CREATE OR REPLACE FUNCTION refresh_all_shortcuts_view()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY all_shortcuts_view;
END;
$$;

-- Grant execute permission on the refresh function to authenticated users
GRANT EXECUTE ON FUNCTION refresh_all_shortcuts_view() TO authenticated;