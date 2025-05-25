import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
import { HomeCategoryService } from './home-category.service';
import {
  HomeCategoryCreateSchema,
  HomeCategoryCreateType,
  HomeCategoryUpdateSchema,
  HomeCategoryUpdateType,
} from './homeCategory.dto';

@Controller('home-category')
export class HomeCategoryController {
  constructor(private homeCategoryService: HomeCategoryService) {}

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
    data: HomeCategoryCreateType,
    @Req() req,
  ) {
    const loggedInUser = req.user as LoggedInUserType;

    const categoryData = HomeCategoryCreateSchema.parse(data);

    const category = this.homeCategoryService.createCategory({
      ...categoryData,
      createdBy: loggedInUser.name,
      image: file ? 'uploads/' + file.filename : undefined,
    });

    return category;
  }

  @Get('/getAll')
  getAll() {
    const results = this.homeCategoryService.getAllHomeCategories();
    return results;
  }
  @Get('/category/:id')
  getone(@Param() params: any) {
    const results = this.homeCategoryService.getOnHomeCategory(+params.id);
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
    @Param() params: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() data: HomeCategoryUpdateType,
  ) {
    const categoryData = HomeCategoryUpdateSchema.parse(
      data,
    ) as HomeCategoryUpdateType;

    const category = this.homeCategoryService.updateCategory(+params.id, {
      ...categoryData,
      image: file ? 'uploads/' + file.filename : undefined,
    });
    return category;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteCategory(@Param() params: any) {
    const result = this.homeCategoryService.deleteCategory(+params.id);

    return result;
  }
}
