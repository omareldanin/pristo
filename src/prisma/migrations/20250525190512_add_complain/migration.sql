-- CreateTable
CREATE TABLE "Complain" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Complain_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Complain" ADD CONSTRAINT "Complain_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
