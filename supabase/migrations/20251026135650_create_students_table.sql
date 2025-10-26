/*
  # Create Students Table

  1. New Tables
    - `students`
      - `id` (integer, primary key, auto increment)
      - `registration_no` (text, unique, not null)
      - `name` (text, not null)
      - `marks` (integer, not null, default 0)
      - `created_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS on `students` table
    - Add policy for authenticated users to perform all operations
    - Add policy for anonymous users to perform all operations (for demo purposes)
*/

CREATE TABLE IF NOT EXISTS students (
  id serial PRIMARY KEY,
  registration_no text UNIQUE NOT NULL,
  name text NOT NULL,
  marks integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to perform all operations
CREATE POLICY "Authenticated users can perform all operations on students"
  ON students
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to perform all operations (for demo purposes)
CREATE POLICY "Anonymous users can perform all operations on students"
  ON students
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);