import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoggedInUserType, loginDto } from './auth.dto';
import { JwtAuthGuard } from 'src/middlewares/jwt-auth.guard';
import { FileInterceptor, NoFilesInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  //sign in request-----------------------------
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  @UseInterceptors(NoFilesInterceptor())
  signIn(@Body() signInDto: loginDto) {
    return this.authService.signIn(
      signInDto.phone,
      signInDto.password,
      signInDto.fcm,
      'CUSTOMER',
    );
  }

  //sign in request-----------------------------
  @HttpCode(HttpStatus.OK)
  @Post('/vendor/login')
  @UseInterceptors(NoFilesInterceptor())
  signInVendor(@Body() signInDto: loginDto) {
    return this.authService.signIn(
      signInDto.phone,
      signInDto.password,
      signInDto.fcm,
      'VENDOR',
    );
  }

  //sign in request-----------------------------
  @HttpCode(HttpStatus.OK)
  @Post('/delivery/login')
  @UseInterceptors(NoFilesInterceptor())
  signInDelivery(@Body() signInDto: loginDto) {
    return this.authService.signIn(
      signInDto.phone,
      signInDto.password,
      signInDto.fcm,
      'DELIVERY',
    );
  }
  //sign up request -----------------------------
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(NoFilesInterceptor())
  @Post('/signup')
  signUp(
    @Body()
    data: {
      name: string;
      phone: string;
      password: string;
      fcm: string | undefined;
    },
  ) {
    return this.authService.signUp(data);
  }

  //send otp to phone number --------------------
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(NoFilesInterceptor())
  @Post('/send-sms')
  sendOtp(@Body() data: { phone: string }) {
    return this.authService.sendOtp(data.phone);
  }

  //confirm otp-----------------------------------
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(NoFilesInterceptor())
  @Post('/confirm-sms')
  condirmOtp(@Body() data: { otp: string; phone: string }) {
    return this.authService.confirmOtp(data);
  }

  //reset user password --------------------------
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(NoFilesInterceptor())
  // @UseGuards(JwtAuthGuard)
  @Post('/reset-password')
  resetPassword(
    @Body()
    resetPassDTo: {
      password: string;
      oldPassword: string | undefined;
      phone: string;
    },
    @Req() req,
  ) {
    // const loggedInUser = req.user as LoggedInUserType;
    return this.authService.resetPassword({
      phone: resetPassDTo.phone,
      password: resetPassDTo.password,
      oldPassword: resetPassDTo.oldPassword,
    });
  }

  //update user profile --------------------------
  @HttpCode(HttpStatus.OK)
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
  @Patch('/update-profile')
  updateProfile(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    data: {
      name: string;
      phone: string;
      fcm: string | undefined;
    },
    @Req() req,
  ) {
    const loggedInUser = req.user as LoggedInUserType;

    return this.authService.updateProfile({
      id: loggedInUser.id,
      phone: data.phone,
      avatar: 'uploads/' + file?.filename,
      name: data.name,
      fcm: data.fcm,
    });
  }
}
