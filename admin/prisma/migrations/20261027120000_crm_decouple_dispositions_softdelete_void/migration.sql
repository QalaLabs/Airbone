-- CRM-03 / CRM-04 / CRM-05 / CRM-11
-- Forward-only remediation for the CRM architecture backlog.
--
-- Every statement is idempotent so the migration is safe to re-run against a
-- database that already received part of the change manually.

-- ── CRM-04: decouple call dispositions from commercial stages ───────────────
-- A disposition ("RINGING", "SWITCHED_OFF", "BUSY", ...) is a contact outcome,
-- not a pipeline stage. Persisting it separately lets the lead stay in its real
-- stage (PROSPECT / INTERESTED / ...).
ALTER TABLE "public"."leads" ADD COLUMN IF NOT EXISTS "lastDisposition" VARCHAR(50);
ALTER TABLE "public"."leads" ADD COLUMN IF NOT EXISTS "dispositionAt" TIMESTAMP(3);

-- ── CRM-05: universal soft delete / recycle bin ─────────────────────────────
-- Leads already had deletedAt in the baseline; deletedBy and the same pair on
-- admissions/students were missing.
ALTER TABLE "public"."leads" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "public"."leads" ADD COLUMN IF NOT EXISTS "deletedBy" UUID;
ALTER TABLE "public"."admissions" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "public"."admissions" ADD COLUMN IF NOT EXISTS "deletedBy" UUID;
ALTER TABLE "public"."students" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "public"."students" ADD COLUMN IF NOT EXISTS "deletedBy" UUID;

-- Replace the unconditional phone unique constraint with a partial unique
-- index. A soft-deleted lead no longer blocks a new enquiry from the same
-- phone number, while duplicate live leads remain impossible.
--
-- Preflight: the partial index cannot be created while duplicate *live* rows
-- exist. Fail with an actionable message instead of a bare index error; resolve
-- duplicates (merge/soft-delete) before re-running.
DO $$
DECLARE
  duplicate_groups integer;
BEGIN
  SELECT count(*) INTO duplicate_groups FROM (
    SELECT 1
    FROM "public"."leads"
    WHERE "deletedAt" IS NULL
    GROUP BY "orgId", "phone"
    HAVING count(*) > 1
  ) dupes;
  IF duplicate_groups > 0 THEN
    RAISE EXCEPTION
      'CRM-05 preflight failed: % live (orgId, phone) duplicate group(s). Merge or soft-delete them before applying this migration.',
      duplicate_groups;
  END IF;
END
$$;

DROP INDEX IF EXISTS "public"."leads_orgId_phone_key";
CREATE UNIQUE INDEX IF NOT EXISTS "leads_org_id_phone_active"
  ON "public"."leads" ("orgId", "phone")
  WHERE "deletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS "leads_orgId_phone_idx"
  ON "public"."leads" ("orgId", "phone");

-- Recycle-bin listing support.
CREATE INDEX IF NOT EXISTS "leads_orgId_deletedAt_idx"
  ON "public"."leads" ("orgId", "deletedAt");
CREATE INDEX IF NOT EXISTS "admissions_orgId_deletedAt_idx"
  ON "public"."admissions" ("orgId", "deletedAt");
CREATE INDEX IF NOT EXISTS "students_orgId_deletedAt_idx"
  ON "public"."students" ("orgId", "deletedAt");

-- ── CRM-03: one deal per lead becomes 1:N (one active deal per course) ──────
DROP INDEX IF EXISTS "public"."deals_orgId_leadId_key";
CREATE INDEX IF NOT EXISTS "deals_orgId_leadId_idx"
  ON "public"."deals" ("orgId", "leadId");

-- ── CRM-11: true ledger reversal (void) instead of hard delete ──────────────
ALTER TYPE "public"."PaymentStatus" ADD VALUE IF NOT EXISTS 'VOIDED';

ALTER TABLE "public"."payment_transactions" ADD COLUMN IF NOT EXISTS "voidedAt" TIMESTAMP(3);
ALTER TABLE "public"."payment_transactions" ADD COLUMN IF NOT EXISTS "voidedBy" UUID;
ALTER TABLE "public"."payment_transactions" ADD COLUMN IF NOT EXISTS "voidReason" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'payment_transactions_voidedBy_fkey'
  ) THEN
    ALTER TABLE "public"."payment_transactions"
      ADD CONSTRAINT "payment_transactions_voidedBy_fkey"
      FOREIGN KEY ("voidedBy") REFERENCES "public"."users"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS "payment_transactions_orgId_voidedAt_idx"
  ON "public"."payment_transactions" ("orgId", "voidedAt");
