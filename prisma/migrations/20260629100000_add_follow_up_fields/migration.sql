-- Lead additions
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "contacted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "contactedAt" TIMESTAMP(3);
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "contactedByUserId" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "followUpEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "followUpCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "lastFollowUpAt" TIMESTAMP(3);
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "nextFollowUpAt" TIMESTAMP(3);
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "followUpStopped" BOOLEAN NOT NULL DEFAULT false;

-- BusinessSettings additions
ALTER TABLE "BusinessSettings" ADD COLUMN IF NOT EXISTS "customerFollowUpEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "BusinessSettings" ADD COLUMN IF NOT EXISTS "followUpSmsEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "BusinessSettings" ADD COLUMN IF NOT EXISTS "followUpEmailEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "BusinessSettings" ADD COLUMN IF NOT EXISTS "followUpDelays" JSONB NOT NULL DEFAULT '[5,24,36,48]';
ALTER TABLE "BusinessSettings" ADD COLUMN IF NOT EXISTS "followUpMaxDays" INTEGER NOT NULL DEFAULT 7;

-- Set nextFollowUpAt for existing uncontacted active leads
UPDATE "Lead"
SET "nextFollowUpAt" = "createdAt" + INTERVAL '5 hours'
WHERE "contacted" = false
  AND "followUpStopped" = false
  AND "status" NOT IN ('COMPLETED', 'LOST')
  AND "nextFollowUpAt" IS NULL;
