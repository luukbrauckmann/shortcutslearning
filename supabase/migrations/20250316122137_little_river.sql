/*
  # Update RLS policies for shortcuts table

  1. Security Changes
    - Enable RLS on shortcuts table
    - Add policies for:
      - Public read access
      - Authenticated users can manage shortcuts (insert, update, delete)

  2. Notes
    - Public users can still view shortcuts for practice
    - Only authenticated users can modify shortcuts
*/

-- Enable RLS
ALTER TABLE shortcuts ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Shortcuts are viewable by everyone"
ON shortcuts
FOR SELECT
TO public
USING (true);

-- Allow authenticated users to manage shortcuts
CREATE POLICY "Authenticated users can manage shortcuts"
ON shortcuts
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);