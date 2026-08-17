-- Migration: Harden fallback_leads RLS (P0-2)
-- Description: fallback_leads stores visitor PII (name, phone, email, pincode).
-- Anonymous/public roles must be INSERT-only (required by the existing serverless
-- fallback flow in src/utils/fallback-storage.js). They must NOT be able to
-- SELECT, UPDATE, or DELETE these rows. Recovery is performed by the backend
-- service role.

ALTER TABLE public.fallback_leads ENABLE ROW LEVEL SECURITY;

-- Remove the broad FOR ALL policy that granted anon/public SELECT + UPDATE.
DROP POLICY IF EXISTS "Allow service role/anon select and update on fallback_leads" ON public.fallback_leads;

-- The anonymous INSERT-only policy ("Allow anonymous/service insert into fallback_leads")
-- remains in place, preserving the existing fallback write path.

-- Explicit service-role recovery access (service_role bypasses RLS in Supabase;
-- this documents the intended backend recovery model).
CREATE POLICY "fallback_leads_service_role_recovery" ON public.fallback_leads
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
