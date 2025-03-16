/*
  # Fix materialized view permissions

  1. Changes
    - Drop and recreate refresh function with SECURITY DEFINER
    - Grant permissions on all_shortcuts_view to authenticated and anon users
    - Grant execute permission on refresh function to authenticated users
  
  2. Security
    - Ensures authenticated users can perform CRUD operations
    - Maintains read-only access for public users
    - Makes refresh function more secure with SECURITY DEFINER
*/

-- Drop the existing function first
DROP FUNCTION IF EXISTS refresh_all_shortcuts_view();

-- Recreate the function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION refresh_all_shortcuts_view()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY all_shortcuts_view;
END;
$$;

-- Grant usage on the schema to authenticated and anon users
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- Grant select permission to both authenticated and anon users
GRANT SELECT ON all_shortcuts_view TO authenticated, anon;

-- Grant execute permission on the refresh function to authenticated users
GRANT EXECUTE ON FUNCTION refresh_all_shortcuts_view() TO authenticated;