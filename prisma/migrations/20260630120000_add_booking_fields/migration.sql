-- Add Google Calendar booking fields to BusinessSettings
ALTER TABLE "BusinessSettings"
  ADD COLUMN IF NOT EXISTS "googleAccessToken"  TEXT,
  ADD COLUMN IF NOT EXISTS "googleRefreshToken" TEXT,
  ADD COLUMN IF NOT EXISTS "googleTokenExpiry"  TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "googleCalendarId"   TEXT,
  ADD COLUMN IF NOT EXISTS "bookingEnabled"      BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "bookingWindowDays"   INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS "bookingSlotDuration" INTEGER NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS "bookingHoursStart"   INTEGER NOT NULL DEFAULT 9,
  ADD COLUMN IF NOT EXISTS "bookingHoursEnd"     INTEGER NOT NULL DEFAULT 17;

-- Add appointment fields to Lead
ALTER TABLE "Lead"
  ADD COLUMN IF NOT EXISTS "appointmentStart" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "appointmentEnd"   TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "googleEventId"    TEXT;
