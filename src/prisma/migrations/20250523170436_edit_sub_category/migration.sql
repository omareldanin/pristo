-- AlterTable
ALTER TABLE "SubCategory" ADD COLUMN     "mainCategoryId" INTEGER;

-- AddForeignKey
ALTER TABLE "SubCategory" ADD CONSTRAINT "SubCategory_mainCategoryId_fkey" FOREIGN KEY ("mainCategoryId") REFERENCES "MainCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
