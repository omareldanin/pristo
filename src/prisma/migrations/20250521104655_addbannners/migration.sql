-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('OPEN', 'CLOSED', 'SOON');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "vendorId" INTEGER;

-- CreateTable
CREATE TABLE "Vendor" (
    "id" INTEGER NOT NULL,
    "status" "VendorStatus" NOT NULL DEFAULT 'OPEN',
    "location" TEXT,
    "longitudes" TEXT,
    "latitude" TEXT,
    "cover" TEXT,
    "deliveryCost" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "orderTime" INTEGER NOT NULL DEFAULT 0,
    "rate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "reviewsCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" SERIAL NOT NULL,
    "order" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
