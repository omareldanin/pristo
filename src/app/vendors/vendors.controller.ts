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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/middlewares/jwt-auth.guard';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { LoggedInUserType } from '../auth/auth.dto';
import { VendorsService } from './vendors.service';
import {
  VendorCreateSchema,
  VendorCreateType,
  VendorFilterSchema,
  VendorUpdateSchema,
} from './vendor.dto';

@Controller('vendors')
export class VendorsController {
  constructor(private vendorService: VendorsService) {}

  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, cb) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            const filename = `${uniqueSuffix}${ext}`;
            cb(null, filename);
          },
        }),
      },
    ),
  )
  @UseGuards(JwtAuthGuard)
  @Post('/create')
  createVendor(
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      cover?: Express.Multer.File[];
    },
    @Body()
    data: VendorCreateType,
  ) {
    const imageFile = files.image?.[0]?.filename ?? null;
    const coverFile = files.cover?.[0]?.filename ?? null;

    const vendorData = VendorCreateSchema.parse(data);

    const result = this.vendorService.createVendor({
      vendorData: {
        ...vendorData,
        avatar: imageFile,
        cover: coverFile,
      },
    });

    return result;
  }

  @Get('/getAll')
  getAll(@Query() filters: any) {
    const vendorFilters = VendorFilterSchema.parse(filters);

    const result = this.vendorService.getAllVendors(vendorFilters);

    return result;
  }

  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, cb) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            const filename = `${uniqueSuffix}${ext}`;
            cb(null, filename);
          },
        }),
      },
    ),
  )
  @UseGuards(JwtAuthGuard)
  @Patch('/edit/:id')
  editVendor(
    @Param('id') id: string,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      cover?: Express.Multer.File[];
    },
    @Body()
    data: VendorCreateType,
  ) {
    const imageFile = files?.image?.[0]?.filename ?? null;
    const coverFile = files?.cover?.[0]?.filename ?? null;

    const vendorData = VendorUpdateSchema.parse(data);

    const result = this.vendorService.updateVendor({
      id: +id,
      vendorData: {
        ...vendorData,
        avatar: imageFile,
        cover: coverFile,
      },
    });

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/delete/:id')
  deleteVendor(@Param('id') id: string) {
    const result = this.vendorService.deleteVendor(+id);

    return result;
  }
}
