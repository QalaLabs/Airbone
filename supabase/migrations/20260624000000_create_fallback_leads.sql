-- Migration: Create fallback_leads table for durable serverless persistence
-- Description: Stores leads when upstream Admin API is down or unreachable.

CREATE TABLE IF NOT EXISTS public.fallback_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    pincode TEXT,
    course TEXT,
    source TEXT,
    retry_count INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'recovered'))
);

-- Add an index on status to optimize replay worker polling
CREATE INDEX IF NOT EXISTS idx_fallback_leads_status ON public.fallback_leads(status) WHERE status = 'pending';

-- Enable Row Level Security (RLS)
ALTER TABLE public.fallback_leads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role / anon inserts and worker updates
CREATE POLICY "Allow anonymous/service insert into fallback_leads" ON public.fallback_leads
    FOR INSERT
    TO public, anon, service_role
    WITH CHECK (true);

CREATE POLICY "Allow service role/anon select and update on fallback_leads" ON public.fallback_leads
    FOR ALL
    TO public, anon, service_role
    USING (true)
    WITH CHECK (true);
