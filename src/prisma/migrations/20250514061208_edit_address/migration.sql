/*
  Warnings:

  - You are about to drop the column `direction` on the `UserAddresses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserAddresses" DROP COLUMN "direction",
ADD COLUMN     "latitude" TEXT,
ADD COLUMN     "longitudes" TEXT;
