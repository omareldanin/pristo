import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/middlewares/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { LoggedInUserType } from '../auth/auth.dto';
import { SubCategoryService } from './sub-category.service';

@Controller('sub-category')
export class SubCategoryController {
  constructor(private subCategoryService: SubCategoryService) {}

  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname); // Get extension, e.g., ".png"
          const filename = `${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
    }),
  )
  @UseGuards(JwtAuthGuard)
  @Post('/create')
  createCategory(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    data: any,
  ) {
    const category = this.subCategoryService.createCategory({
      ...data,
      image: 'uploads/' + file.filename,
    });

    return category;
  }

  @Get('/getAll')
  getAll(@Query('mainCategoryId') mainCategoryId: number) {
    const results = this.subCategoryService.getAllSubCategories(mainCategoryId);
    return results;
  }

  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname); // Get extension, e.g., ".png"
          const filename = `${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
    }),
  )
  @UseGuards(JwtAuthGuard)
  @Patch('/edit/:id')
  editCategory(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: number,
    @Body()
    data: any,
  ) {
    const category = this.subCategoryService.editOne({
      ...data,
      image: file ? 'uploads/' + file.filename : undefined,
      id: +id,
    });

    return category;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/delete/:id')
  deleteCategory(@Param('id') id: number) {
    const category = this.subCategoryService.deleteOne(+id);

    return category;
  }
}
