-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('STARTER', 'PROFESSIONAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "ReceptionistVoice" AS ENUM ('EMMA', 'SARAH', 'JAMES', 'OLIVER');

-- CreateEnum
CREATE TYPE "ReceptionistAccent" AS ENUM ('BRITISH', 'AMERICAN', 'AUSTRALIAN', 'IRISH', 'SCOTTISH');

-- CreateEnum
CREATE TYPE "ReceptionistTone" AS ENUM ('FRIENDLY', 'PROFESSIONAL', 'LUXURY', 'CASUAL');

-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('PLUMBER', 'ELECTRICIAN', 'HEATING_ENGINEER', 'BUILDER', 'LOCKSMITH', 'CLEANING_COMPANY', 'HVAC');

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "businessPhone" TEXT,
ADD COLUMN     "businessType" "BusinessType",
ADD COLUMN     "emergencyService" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "openingHoursText" TEXT,
ADD COLUMN     "receptionistAccent" "ReceptionistAccent",
ADD COLUMN     "receptionistGender" TEXT,
ADD COLUMN     "receptionistName" TEXT,
ADD COLUMN     "receptionistTone" "ReceptionistTone",
ADD COLUMN     "receptionistVoice" "ReceptionistVoice",
ADD COLUMN     "subscriptionPlan" "SubscriptionPlan",
ALTER COLUMN "ownerPhone" DROP NOT NULL;
