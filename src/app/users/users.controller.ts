import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/middlewares/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { LoggedInUserType } from '../auth/auth.dto';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
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
  @Post('/create-delivery')
  updateProfile(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    data: any,
    // @Req() req,
  ) {
    // const loggedInUser = req.user as LoggedInUserType;

    const delivery = this.userService.createDelivery({
      ...data,
      avatar: 'uploads/' + file?.filename,
    });

    return delivery;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/get-profile')
  getUserProfile(@Req() req) {
    const loggedInUser = req.user as LoggedInUserType;

    const user = this.userService.getProfile(+loggedInUser.id);

    return { results: user };
  }
}
