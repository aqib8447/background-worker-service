-- AlterTable
ALTER TABLE "notification" ADD COLUMN     "memberId" TEXT;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
