-- Execute this in Supabase SQL Editor (supabase.com > your project > SQL Editor)

CREATE TABLE IF NOT EXISTS cortisol_profiles (
  id BIGSERIAL PRIMARY KEY,
  name TEXT,
  email TEXT,
  age INTEGER,
  sleep_hours TEXT,
  bedtime TEXT,
  stress_level TEXT,
  relaxation TEXT,
  exercise TEXT,
  outdoor TEXT,
  diet TEXT,
  water TEXT,
  sugar TEXT,
  caffeine TEXT,
  cortisol_score INTEGER,
  score_sleep INTEGER,
  score_stress INTEGER,
  score_exercise INTEGER,
  score_nutrition INTEGER,
  score_water INTEGER,
  score_outdoor INTEGER,
  caffeine_penalty INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow inserts from the API
ALTER TABLE cortisol_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public inserts" ON cortisol_profiles
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public select" ON cortisol_profiles
  FOR SELECT TO anon
  USING (true);
