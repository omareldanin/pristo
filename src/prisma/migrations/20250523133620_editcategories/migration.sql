/*
  Warnings:

  - You are about to drop the column `homeCateogryId` on the `User` table. All the data in the column will be lost.
  - Changed the type of `name` on the `HomeCategory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `name` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_homeCateogryId_fkey";

-- AlterTable
ALTER TABLE "HomeCategory" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
DROP COLUMN "name",
ADD COLUMN     "name" JSONB NOT NULL,
ALTER COLUMN "image" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "homeCateogryId",
ADD COLUMN     "homeCategoryId" INTEGER;

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "name" JSONB NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_homeCategoryId_fkey" FOREIGN KEY ("homeCategoryId") REFERENCES "HomeCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
