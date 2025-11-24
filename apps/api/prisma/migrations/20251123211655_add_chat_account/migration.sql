/*
  Warnings:

  - Added the required column `orgId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Message_conversationId_idx";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "orgId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ChatAccount" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "externalPhoneId" TEXT NOT NULL,
    "accountSid" TEXT,
    "authToken" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatAccount_orgId_provider_idx" ON "ChatAccount"("orgId", "provider");

-- CreateIndex
CREATE INDEX "ChatAccount_provider_externalPhoneId_idx" ON "ChatAccount"("provider", "externalPhoneId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatAccount_orgId_provider_externalPhoneId_key" ON "ChatAccount"("orgId", "provider", "externalPhoneId");

-- CreateIndex
CREATE INDEX "Conversation_orgId_lastMessageAt_idx" ON "Conversation"("orgId", "lastMessageAt");

-- CreateIndex
CREATE INDEX "Message_orgId_sentAt_idx" ON "Message"("orgId", "sentAt");

-- CreateIndex
CREATE INDEX "Message_conversationId_sentAt_idx" ON "Message"("conversationId", "sentAt");

-- AddForeignKey
ALTER TABLE "ChatAccount" ADD CONSTRAINT "ChatAccount_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE CASCADE ON UPDATE CASCADE;
