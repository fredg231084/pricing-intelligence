/*
  # Pricing Intelligence App Schema
  
  1. New Tables
    - `app_settings`
      - `id` (uuid, primary key) - Unique identifier
      - `serpapi_key` (text) - SerpApi API key (encrypted)
      - `llm_api_key` (text) - LLM API key (encrypted)
      - `llm_provider` (text) - 'claude' or 'gpt'
      - `default_currency` (text) - 'CAD' or 'USD'
      - `default_region` (text) - 'canada' or 'usa'
      - `use_ai_filtering` (boolean) - Toggle AI filtering
      - `updated_at` (timestamptz) - Last update timestamp
      
    - `search_cache`
      - `id` (uuid, primary key) - Unique identifier
      - `search_type` (text) - 'hockey_card' or 'macbook'
      - `search_query` (text) - Search query string
      - `search_params` (jsonb) - Additional search parameters
      - `raw_results` (jsonb) - Raw SerpApi results
      - `analyzed_results` (jsonb) - LLM analyzed results
      - `created_at` (timestamptz) - Cache creation time
      - `expires_at` (timestamptz) - Cache expiration time
      
    - `search_history`
      - `id` (uuid, primary key) - Unique identifier
      - `search_type` (text) - 'hockey_card' or 'macbook'
      - `search_query` (text) - Search query string
      - `median_price` (numeric) - Final median price
      - `currency` (text) - Price currency
      - `comps_used` (integer) - Number of comps used
      - `comps_excluded` (integer) - Number of comps excluded
      - `confidence_score` (integer) - Confidence score 0-100
      - `created_at` (timestamptz) - Search timestamp
      
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access (for now, allow all access since this is a single-user app)
    
  3. Indexes
    - Index on search_cache (search_type, search_query) for fast lookups
    - Index on search_history created_at for recent searches
*/

-- Create app_settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  serpapi_key text DEFAULT '',
  llm_api_key text DEFAULT '',
  llm_provider text DEFAULT 'claude',
  default_currency text DEFAULT 'CAD',
  default_region text DEFAULT 'canada',
  use_ai_filtering boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- Create search_cache table
CREATE TABLE IF NOT EXISTS search_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_type text NOT NULL,
  search_query text NOT NULL,
  search_params jsonb DEFAULT '{}'::jsonb,
  raw_results jsonb DEFAULT '{}'::jsonb,
  analyzed_results jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '1 hour')
);

-- Create search_history table
CREATE TABLE IF NOT EXISTS search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_type text NOT NULL,
  search_query text NOT NULL,
  median_price numeric,
  currency text,
  comps_used integer DEFAULT 0,
  comps_excluded integer DEFAULT 0,
  confidence_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing all access for now - single user app)
CREATE POLICY "Allow all access to app_settings"
  ON app_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to search_cache"
  ON search_cache
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to search_history"
  ON search_history
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_search_cache_lookup 
  ON search_cache(search_type, search_query);
  
CREATE INDEX IF NOT EXISTS idx_search_cache_expires 
  ON search_cache(expires_at);
  
CREATE INDEX IF NOT EXISTS idx_search_history_created 
  ON search_history(created_at DESC);

-- Insert default settings row if none exists
INSERT INTO app_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM app_settings);
