-- CreateEnum
CREATE TYPE "CallingJobStatus" AS ENUM (
    'QUEUED',
    'PROCESSING',
    'INITIATED',
    'RINGING',
    'ANSWERED',
    'COMPLETED',
    'FAILED',
    'RETRY_SCHEDULED',
    'SKIPPED',
    'CANCELLED'
);

-- AlterTable "leads"
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "latestCallStatus" VARCHAR(50);
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "latestCallOutcome" VARCHAR(50);
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "lastCallAt" TIMESTAMP(3);
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "lastCallDuration" INTEGER;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "callAttemptCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "nextCallAt" TIMESTAMP(3);
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "doNotCall" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "lastCallSummary" TEXT;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "telecmiConversationId" VARCHAR(100);
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "autoCallingEnabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable "calling_jobs"
CREATE TABLE IF NOT EXISTS "calling_jobs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orgId" UUID NOT NULL,
    "leadId" UUID NOT NULL,
    "provider" VARCHAR(50) NOT NULL DEFAULT 'telecmi',
    "status" "CallingJobStatus" NOT NULL DEFAULT 'QUEUED',
    "phone" VARCHAR(50) NOT NULL,
    "leadName" VARCHAR(255),
    "courseInterest" VARCHAR(255),
    "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "nextAttemptAt" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),
    "lockedBy" VARCHAR(100),
    "lastErrorCode" VARCHAR(100),
    "lastErrorMessage" TEXT,
    "providerCallId" VARCHAR(100),
    "idempotencyKey" VARCHAR(255) NOT NULL,
    "skipReason" VARCHAR(100),

    -- Timing metrics
    "leadCreatedAt" TIMESTAMP(3),
    "jobCreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jobStartedAt" TIMESTAMP(3),
    "providerRequestAt" TIMESTAMP(3),
    "providerAcceptedAt" TIMESTAMP(3),
    "callStartedAt" TIMESTAMP(3),
    "callAnsweredAt" TIMESTAMP(3),
    "callCompletedAt" TIMESTAMP(3),
    "initiationLatencyMs" INTEGER,

    -- Call outcome
    "durationSecs" INTEGER,
    "callOutcome" VARCHAR(50),
    "recordingUrl" TEXT,
    "transcript" TEXT,
    "summary" TEXT,
    "requiresHumanFollowup" BOOLEAN NOT NULL DEFAULT false,
    "callbackRequestedAt" TIMESTAMP(3),

    "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calling_jobs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "calling_jobs_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "calling_jobs_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndexes
CREATE UNIQUE INDEX IF NOT EXISTS "calling_jobs_orgId_idempotencyKey_key" ON "calling_jobs"("orgId", "idempotencyKey");
CREATE INDEX IF NOT EXISTS "calling_jobs_orgId_status_scheduledAt_idx" ON "calling_jobs"("orgId", "status", "scheduledAt");
CREATE INDEX IF NOT EXISTS "calling_jobs_leadId_idx" ON "calling_jobs"("leadId");
CREATE INDEX IF NOT EXISTS "calling_jobs_providerCallId_idx" ON "calling_jobs"("providerCallId");
CREATE INDEX IF NOT EXISTS "calling_jobs_status_nextAttemptAt_idx" ON "calling_jobs"("status", "nextAttemptAt");
