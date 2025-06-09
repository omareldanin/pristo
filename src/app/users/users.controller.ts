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

    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getAll')
  getAll(@Query() filters: any) {
    const result = this.userService.getAllUser(filters);

    return result;
  }
  @UseGuards(JwtAuthGuard)
  @Delete('/delete/:id')
  deleteUser(@Param('id') id: number) {
    const result = this.userService.deleteUser(+id);

    return result;
  }

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
  @Patch('/update-delivery')
  updateDelivey(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    data: {
      id: number;
      name: string;
      phone: string;
    },
    @Req() req,
  ) {
    return this.userService.updateDelivery({
      id: +data.id,
      phone: data.phone,
      avatar: file ? 'uploads/' + file?.filename : undefined,
      name: data.name,
    });
  }
}
