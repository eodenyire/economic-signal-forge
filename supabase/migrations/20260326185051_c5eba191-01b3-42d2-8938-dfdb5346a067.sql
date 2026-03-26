
-- Add new roles to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'client';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'investor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'third_party';

-- Add a requested_role column to profiles so users can pick their role at signup
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS requested_role text DEFAULT 'client';

-- Add an avatar_url column for social login profile pics
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- Create macro_events table for seeding macro data
CREATE TABLE IF NOT EXISTS public.macro_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date timestamp with time zone NOT NULL,
  impact text NOT NULL DEFAULT 'medium',
  category text NOT NULL DEFAULT 'economic',
  source text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.macro_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read macro events" ON public.macro_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage macro events" ON public.macro_events FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Create sentiment_data table
CREATE TABLE IF NOT EXISTS public.sentiment_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  source text NOT NULL,
  score numeric NOT NULL,
  label text NOT NULL,
  headline text,
  analyzed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.sentiment_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read sentiment" ON public.sentiment_data FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage sentiment" ON public.sentiment_data FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Create portfolio_snapshots table
CREATE TABLE IF NOT EXISTS public.portfolio_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date date NOT NULL,
  portfolio_value numeric NOT NULL,
  benchmark_value numeric NOT NULL,
  daily_return numeric,
  cumulative_return numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.portfolio_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read portfolio snapshots" ON public.portfolio_snapshots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage portfolio snapshots" ON public.portfolio_snapshots FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
