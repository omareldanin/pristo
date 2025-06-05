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
import { LoggedInUserType } from '../auth/auth.dto';
import { JwtAuthGuard } from 'src/middlewares/jwt-auth.guard';
import { BannerService } from './banner.service';
import { FileInterceptor, NoFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BannerUpdateSchema, BannerUpdateType } from './banner.dto';

@Controller('banner')
export class BannerController {
  constructor(private bannerService: BannerService) {}

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
  createBanner(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    data: { image: string | undefined; order: number },
    @Req() req,
  ) {
    const loggedInUser = req.user as LoggedInUserType;

    const banner = this.bannerService.createBanner({
      ...data,
      createdBy: loggedInUser.name,
      image: 'uploads/' + file.filename,
    });

    return banner;
  }

  @Get('/getAll')
  getAllBanners() {
    const banners = this.bannerService.getAllBanners();
    return banners;
  }

  @UseInterceptors(NoFilesInterceptor())
  @UseGuards(JwtAuthGuard)
  @Patch('/edit/:id')
  editBanner(
    @Param() params: any,
    @Body() data: { order: number; active: boolean },
  ) {
    const bannerdata = BannerUpdateSchema.parse(data) as BannerUpdateType;

    const banner = this.bannerService.editBanner({
      ...bannerdata,
      id: +params.id,
    });
    return banner;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  deleteBanner(@Param() params: any) {
    const result = this.bannerService.deleteBanner(+params.id);
    return result;
  }
}
