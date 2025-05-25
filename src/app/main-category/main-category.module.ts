import { Module } from '@nestjs/common';
import { MainCategoryService } from './main-category.service';
import { MainCategoryController } from './main-category.controller';

@Module({
  providers: [MainCategoryService],
  controllers: [MainCategoryController]
})
export class MainCategoryModule {}
