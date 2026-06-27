-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'BOOKED', 'COMPLETED', 'LOST');

-- CreateEnum
CREATE TYPE "Urgency" AS ENUM ('EMERGENCY', 'URGENT', 'ROUTINE');

-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'FAILED', 'NO_ANSWER', 'VOICEMAIL');

-- CreateEnum
CREATE TYPE "ConversationStep" AS ENUM ('GREETING', 'NAME', 'PHONE', 'JOB_TYPE', 'DESCRIPTION', 'URGENCY', 'ADDRESS', 'CONFIRMATION', 'COMPLETE');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'MEMBER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "clerkOrgId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ownerEmail" TEXT NOT NULL,
    "ownerPhone" TEXT NOT NULL,
    "twilioNumberSid" TEXT,
    "twilioPhoneNumber" TEXT,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "trialEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessMember" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessSettings" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "greetingMessage" TEXT NOT NULL DEFAULT 'Hello, thanks for calling. How can I help you today?',
    "afterHoursMessage" TEXT NOT NULL DEFAULT 'We''re currently closed. Leave your details and we''ll call you back.',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/London',
    "openingHours" JSONB NOT NULL DEFAULT '{"mon":"08:00-18:00","tue":"08:00-18:00","wed":"08:00-18:00","thu":"08:00-18:00","fri":"08:00-18:00","sat":"09:00-14:00","sun":"closed"}',
    "servicesOffered" TEXT[] DEFAULT ARRAY['boiler repair', 'leak fix', 'drain unblocking', 'heating', 'general plumbing']::TEXT[],
    "notifyPhone" TEXT,
    "notifyEmail" TEXT,
    "smsTemplate" TEXT NOT NULL DEFAULT 'New lead from {name} ({phone}): {jobType} — {urgency}. Address: {address}.',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Call" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "twilioCallSid" TEXT NOT NULL,
    "callerPhone" TEXT NOT NULL,
    "durationSeconds" INTEGER,
    "recordingUrl" TEXT,
    "status" "CallStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Call_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "twilioCallSid" TEXT NOT NULL,
    "messages" JSONB NOT NULL DEFAULT '[]',
    "collectedData" JSONB NOT NULL DEFAULT '{}',
    "currentStep" "ConversationStep" NOT NULL DEFAULT 'GREETING',
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "callId" TEXT,
    "callerName" TEXT,
    "callerPhone" TEXT NOT NULL,
    "jobType" TEXT,
    "description" TEXT,
    "urgency" "Urgency" NOT NULL DEFAULT 'ROUTINE',
    "address" TEXT,
    "postcode" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "smsSentAt" TIMESTAMP(3),
    "emailSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_clerkUserId_idx" ON "User"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Business_clerkOrgId_key" ON "Business"("clerkOrgId");

-- CreateIndex
CREATE UNIQUE INDEX "Business_slug_key" ON "Business"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Business_twilioPhoneNumber_key" ON "Business"("twilioPhoneNumber");

-- CreateIndex
CREATE INDEX "Business_twilioPhoneNumber_idx" ON "Business"("twilioPhoneNumber");

-- CreateIndex
CREATE INDEX "Business_slug_idx" ON "Business"("slug");

-- CreateIndex
CREATE INDEX "BusinessMember_businessId_idx" ON "BusinessMember"("businessId");

-- CreateIndex
CREATE INDEX "BusinessMember_userId_idx" ON "BusinessMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessMember_businessId_userId_key" ON "BusinessMember"("businessId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessSettings_businessId_key" ON "BusinessSettings"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "Call_twilioCallSid_key" ON "Call"("twilioCallSid");

-- CreateIndex
CREATE INDEX "Call_businessId_idx" ON "Call"("businessId");

-- CreateIndex
CREATE INDEX "Call_twilioCallSid_idx" ON "Call"("twilioCallSid");

-- CreateIndex
CREATE INDEX "Call_businessId_createdAt_idx" ON "Call"("businessId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_callId_key" ON "Conversation"("callId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_twilioCallSid_key" ON "Conversation"("twilioCallSid");

-- CreateIndex
CREATE INDEX "Conversation_businessId_idx" ON "Conversation"("businessId");

-- CreateIndex
CREATE INDEX "Conversation_twilioCallSid_idx" ON "Conversation"("twilioCallSid");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_callId_key" ON "Lead"("callId");

-- CreateIndex
CREATE INDEX "Lead_businessId_idx" ON "Lead"("businessId");

-- CreateIndex
CREATE INDEX "Lead_businessId_status_idx" ON "Lead"("businessId", "status");

-- CreateIndex
CREATE INDEX "Lead_businessId_urgency_idx" ON "Lead"("businessId", "urgency");

-- CreateIndex
CREATE INDEX "Lead_businessId_createdAt_idx" ON "Lead"("businessId", "createdAt");

-- AddForeignKey
ALTER TABLE "BusinessMember" ADD CONSTRAINT "BusinessMember_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessMember" ADD CONSTRAINT "BusinessMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessSettings" ADD CONSTRAINT "BusinessSettings_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Call"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Call"("id") ON DELETE SET NULL ON UPDATE CASCADE;
