-- Drop the default first (it depends on the enum type), then convert to text
ALTER TABLE "Lead" ALTER COLUMN "urgency" DROP DEFAULT;
ALTER TABLE "Lead" ALTER COLUMN "urgency" TYPE text;

-- Migrate existing values to new naming
UPDATE "Lead" SET "urgency" = 'LOW'         WHERE "urgency" = 'ROUTINE';
UPDATE "Lead" SET "urgency" = 'MODERATE'    WHERE "urgency" = 'URGENT';
UPDATE "Lead" SET "urgency" = 'VERY_URGENT' WHERE "urgency" = 'EMERGENCY';

-- Drop old enum and create new one
DROP TYPE "Urgency";
CREATE TYPE "Urgency" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'VERY_URGENT');

-- Convert column back to enum
ALTER TABLE "Lead"
  ALTER COLUMN "urgency" TYPE "Urgency" USING "urgency"::"Urgency",
  ALTER COLUMN "urgency" SET DEFAULT 'LOW'::"Urgency";

-- Update SMS template default for new records
ALTER TABLE "BusinessSettings"
  ALTER COLUMN "smsTemplate" SET DEFAULT '🚨 NEW LEAD\nUrgency: {urgency}\nCustomer: {name}\nIssue: {jobType}\nPostcode: {postcode}\nPhone: {phone}';
