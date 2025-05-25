-- AlterTable
ALTER TABLE "MainCategory" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deletedBy" TEXT;

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "feature" BOOLEAN NOT NULL DEFAULT false;
