-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "autoCaptured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastRepliedAt" TIMESTAMP(3),
ADD COLUMN     "priceResistance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Org" ADD COLUMN     "businessType" TEXT,
ADD COLUMN     "playbookConfig" JSONB;

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "insertedInChat" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastViewedAt" TIMESTAMP(3),
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "customer" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowupDraft" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FollowupDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkOrder_leadId_idx" ON "WorkOrder"("leadId");

-- CreateIndex
CREATE INDEX "WorkOrder_orgId_idx" ON "WorkOrder"("orgId");

-- CreateIndex
CREATE INDEX "FollowupDraft_leadId_idx" ON "FollowupDraft"("leadId");

-- CreateIndex
CREATE INDEX "Lead_orgId_stage_idx" ON "Lead"("orgId", "stage");

-- CreateIndex
CREATE INDEX "Lead_orgId_createdAt_idx" ON "Lead"("orgId", "createdAt");

-- CreateIndex
CREATE INDEX "Quote_leadId_idx" ON "Quote"("leadId");

-- CreateIndex
CREATE INDEX "Quote_status_idx" ON "Quote"("status");

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowupDraft" ADD CONSTRAINT "FollowupDraft_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
