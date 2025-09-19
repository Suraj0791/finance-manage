-- AlterTable
ALTER TABLE "settlements" ADD COLUMN     "fromAnonymousMemberId" TEXT,
ADD COLUMN     "toAnonymousMemberId" TEXT,
ALTER COLUMN "fromUserId" DROP NOT NULL,
ALTER COLUMN "toUserId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "settlements_fromAnonymousMemberId_idx" ON "settlements"("fromAnonymousMemberId");

-- CreateIndex
CREATE INDEX "settlements_toAnonymousMemberId_idx" ON "settlements"("toAnonymousMemberId");

-- AddForeignKey
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_fromAnonymousMemberId_fkey" FOREIGN KEY ("fromAnonymousMemberId") REFERENCES "anonymous_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_toAnonymousMemberId_fkey" FOREIGN KEY ("toAnonymousMemberId") REFERENCES "anonymous_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
