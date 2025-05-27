import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/middlewares/jwt-auth.guard';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import { ProductCategoryService } from './product-category.service';

@Controller('product-category')
export class ProductCategoryController {
  constructor(private productCategoryService: ProductCategoryService) {}

  @UseInterceptors(NoFilesInterceptor())
  @UseGuards(JwtAuthGuard)
  @Post('/create')
  createCategory(
    @Body()
    data: any,
  ) {
    const category = this.productCategoryService.createCategory({
      ...data,
    });

    return category;
  }

  @Get('/getAll')
  getAll(@Query('mainCategoryId') mainCategoryId: number) {
    const results =
      this.productCategoryService.getAllCategories(mainCategoryId);
    return results;
  }

  @UseInterceptors(NoFilesInterceptor())
  @UseGuards(JwtAuthGuard)
  @Patch('/edit/:id')
  editCategory(
    @Param('id') id: number,
    @Body()
    data: any,
  ) {
    const category = this.productCategoryService.editOne({
      ...data,
      id: +id,
    });

    return category;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/delete/:id')
  deleteCategory(@Param('id') id: number) {
    const category = this.productCategoryService.deleteOne(+id);

    return category;
  }
}
