-- CreateTable
CREATE TABLE "General" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "General_pkey" PRIMARY KEY ("id")
);
