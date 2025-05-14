-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "fcm" TEXT;
