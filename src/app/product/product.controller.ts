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
import { ProductService } from './product.service';
import { JwtAuthGuard } from 'src/middlewares/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { LoggedInUserType } from '../auth/auth.dto';
import {
  ProductCreateSchema,
  ProductCreateType,
  ProductUpdateType,
} from './product.dto';

@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

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
  createProduct(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    data: ProductCreateType,
    @Req() req,
  ) {
    const loggedInUser = req.user as LoggedInUserType;

    const productData = ProductCreateSchema.parse(data);

    const product = this.productService.createProduct({
      ...productData,
      image: 'uploads/' + file.filename,
    });

    return product;
  }

  @Get('/getAll')
  getAllProducts(
    @Query()
    filters: {
      page: number;
      size: number;
      vendorId: number;
      productCategoryId: number;
      name: string;
      orders: string;
    },
  ) {
    const result = this.productService.getProducts(filters);

    return result;
  }

  @Get('/searchByName')
  searchByName(
    @Query()
    filters: {
      name: string;
    },
  ) {
    const result = this.productService.searchByName(filters.name);

    return result;
  }
  @Get('/:id')
  getOne(
    @Param('id')
    id: number,
  ) {
    const result = this.productService.getOne(+id);

    return result;
  }

  @Get('/getVendorPage/:id')
  getVendorPage(@Param('id') id: number) {
    const result = this.productService.getVendorWithProducts(+id);
    return result;
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
  updateProduct(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    data: ProductUpdateType,
    @Param('id') id: number,
    @Req() req,
  ) {
    const loggedInUser = req.user as LoggedInUserType;

    const productData = ProductCreateSchema.parse(data);

    const product = this.productService.editOne(+id, {
      ...productData,
      image: file ? 'uploads/' + file.filename : undefined,
    });

    return product;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/delete/:id')
  deleteProduct(
    @Body()
    @Param('id')
    id: number,
    @Req() req,
  ) {
    const loggedInUser = req.user as LoggedInUserType;

    const product = this.productService.deleteOne(+id);

    return product;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/createGroupWithOptions')
  createGroup(@Body() data: any) {
    const result = this.productService.createGroupWithOptions(
      +data.productId,
      data.group,
    );

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/editGroupWithOptions/:id')
  editGroup(@Body() data: any) {
    const result = this.productService.editGroupWithOptions(
      +data.groupId,
      data.group,
    );

    return result;
  }
  @UseGuards(JwtAuthGuard)
  @Delete('/deleteGroup/:id')
  deleteGroup(@Param('id') id: number) {
    const result = this.productService.deleteGroup(+id);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/deleteOption/:id')
  deleteOption(@Param('id') id: number) {
    const result = this.productService.deleteOption(+id);
    return result;
  }
}
