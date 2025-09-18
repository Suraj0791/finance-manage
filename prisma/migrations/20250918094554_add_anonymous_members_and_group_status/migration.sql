-- CreateEnum
CREATE TYPE "GroupStatus" AS ENUM ('ACTIVE', 'FINISHED', 'ARCHIVED');

-- DropIndex
DROP INDEX "expense_shares_expenseId_userId_key";

-- AlterTable
ALTER TABLE "expense_shares" ADD COLUMN     "anonymousMemberId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "group_expenses" ADD COLUMN     "paidByAnonymousMemberId" TEXT,
ALTER COLUMN "paidByUserId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "status" "GroupStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "anonymous_members" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "anonymous_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "anonymous_members_groupId_idx" ON "anonymous_members"("groupId");

-- CreateIndex
CREATE INDEX "expense_shares_anonymousMemberId_idx" ON "expense_shares"("anonymousMemberId");

-- CreateIndex
CREATE INDEX "group_expenses_paidByAnonymousMemberId_idx" ON "group_expenses"("paidByAnonymousMemberId");

-- AddForeignKey
ALTER TABLE "anonymous_members" ADD CONSTRAINT "anonymous_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_expenses" ADD CONSTRAINT "group_expenses_paidByAnonymousMemberId_fkey" FOREIGN KEY ("paidByAnonymousMemberId") REFERENCES "anonymous_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_shares" ADD CONSTRAINT "expense_shares_anonymousMemberId_fkey" FOREIGN KEY ("anonymousMemberId") REFERENCES "anonymous_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
