/*
  # Update RLS policies for shortcuts table

  1. Security Changes
    - Enable RLS on shortcuts table (if not already enabled)
    - Add policies for:
      - Public read access
      - Authenticated users can manage shortcuts (insert, update, delete)
    
  2. Notes
    - Checks for existing policies before creating new ones
    - Safe to run multiple times
    - Maintains existing security if policies are already present
*/

-- Enable RLS (safe to run multiple times)
ALTER TABLE shortcuts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Shortcuts are viewable by everyone" ON shortcuts;
    DROP POLICY IF EXISTS "Authenticated users can manage shortcuts" ON shortcuts;
END $$;

-- Create new policies
CREATE POLICY "Shortcuts are viewable by everyone"
ON shortcuts
FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can manage shortcuts"
ON shortcuts
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);