-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "wallet" DECIMAL(65,30) NOT NULL DEFAULT 0;
