/*
  # Create shortcuts table and initial data

  1. New Tables
    - `shortcuts`
      - `id` (uuid, primary key)
      - `shortcut` (text, unique)
      - `meaning` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `shortcuts` table
    - Add policies for:
      - Public read access
      - Authenticated users can manage shortcuts
*/

CREATE TABLE IF NOT EXISTS shortcuts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shortcut text UNIQUE NOT NULL,
  meaning text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

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
  USING (auth.role() = 'authenticated');

-- Insert initial data
INSERT INTO shortcuts (shortcut, meaning) VALUES
  ('AAS', 'Amsterdam Airport Schiphol'),
  ('ABP', 'Able Bodied Person'),
  ('A/C', 'Aircraft'),
  ('ACARS', 'Aircraft communications addressing and reporting system'),
  ('ACL', 'Aircraft cabin log'),
  ('AFT', 'Rear part of the aircraft'),
  ('AMS', 'Amsterdam'),
  ('APU', 'Auxiliary Power Unit'),
  ('ASR', 'Air safety report'),
  ('ATA', 'Actual Time of Arrival'),
  ('ATC', 'Air traffic control'),
  ('AVIH', 'Animal in hold'),
  ('CAT', 'Clear air turbulence'),
  ('CXD', 'Cancelled'),
  ('DEPA', 'Deportee Accompanied'),
  ('DEPU', 'Deportee Unaccompanied'),
  ('DG', 'Dangerous goods'),
  ('EASA', 'European Aviation Safety agency'),
  ('F/O', 'First officer'),
  ('FWD', 'Front part of the aircraft'),
  ('GPU', 'Ground power unit'),
  ('ICAO', 'International Civil Aviation Organisation'),
  ('IED', 'Improvised explosive device'),
  ('JCRM', 'Joint crew resource management'),
  ('LAV', 'Lavatory'),
  ('LIAC', 'Late incoming aircraft'),
  ('LT', 'Local Time'),
  ('OCC', 'Operations Control Center'),
  ('PA', 'Public Address'),
  ('PAP', 'Passenger'),
  ('PAX', 'Passengers'),
  ('PED', 'Portable Electronic Device'),
  ('PETC', 'Pet in cabin'),
  ('PIL', 'Passenger information list'),
  ('PRM', 'Person with Reduced Mobility'),
  ('SCD', 'Subject to commander''s discretion'),
  ('SCP', 'Special Category of passengers'),
  ('SPL', 'Schiphol'),
  ('STA', 'Scheduled Time of Arrival'),
  ('STD', 'Scheduled Time of Departure'),
  ('SVAN', 'Service Animal'),
  ('TUC', 'Time of useful consciousness'),
  ('UM/UMNR', 'Unaccompanied Minor'),
  ('UTC', 'Universal Time Coordinated'),
  ('WCH', 'Wheelchair (R/S/C)'),
  ('Zulu', 'Global time index');