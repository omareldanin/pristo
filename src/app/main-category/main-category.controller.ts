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
import { MainCategoryService } from './main-category.service';
import { JwtAuthGuard } from 'src/middlewares/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { LoggedInUserType } from '../auth/auth.dto';
import {
  MainCategoryCreateSchema,
  MainCategoryCreateType,
  MainCategoryUpdateSchema,
  MainCategoryUpdateType,
} from './mainCategory.dto';
@Controller('main-category')
export class MainCategoryController {
  constructor(private mainCategoryService: MainCategoryService) {}

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
    data: MainCategoryCreateType,
    @Req() req,
  ) {
    const loggedInUser = req.user as LoggedInUserType;

    const categoryData = MainCategoryCreateSchema.parse(data);

    const category = this.mainCategoryService.createCategory({
      ...categoryData,
      createdBy: loggedInUser.name,
      image: 'uploads/' + file.filename,
    });

    return category;
  }

  @Get('/getAll')
  getAll() {
    const results = this.mainCategoryService.getAllMainCategories();
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
    @Body() data: MainCategoryUpdateType,
  ) {
    const categoryData = MainCategoryUpdateSchema.parse(
      data,
    ) as MainCategoryUpdateType;

    const banner = this.mainCategoryService.updateCategory(+params.id, {
      ...categoryData,
      image: file ? 'uploads/' + file.filename : undefined,
    });
    return banner;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/deactive/:id')
  deActiveCategory(@Param() params: any, @Req() req) {
    const loggedInUser = req.user as LoggedInUserType;
    const result = this.mainCategoryService.deactiveCategory({
      id: +params.id,
      deleteBy: loggedInUser.name,
    });

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/reactive/:id')
  reActiveCategory(@Param() params: any) {
    const result = this.mainCategoryService.reactiveCategory({
      id: +params.id,
    });

    return result;
  }
}
