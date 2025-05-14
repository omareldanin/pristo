-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN', 'ADMIN_ASSISTANT', 'VENDOR', 'DELIVERY');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "role" "UserRole" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAddresses" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "direction" TEXT,
    "userId" INTEGER,

    CONSTRAINT "UserAddresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- AddForeignKey
ALTER TABLE "UserAddresses" ADD CONSTRAINT "UserAddresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
