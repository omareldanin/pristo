import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import { AddressCreateType, AddressUpdateType } from './address.dto';
import { JwtAuthGuard } from 'src/middlewares/jwt-auth.guard';
import { LoggedInUserType } from '../auth/auth.dto';

@Controller('address')
export class AddressController {
  constructor(private addressService: AddressService) {}

  @UseInterceptors(NoFilesInterceptor())
  @UseGuards(JwtAuthGuard)
  @Post('/create')
  createAddress(@Body() data: AddressCreateType, @Req() req) {
    const loggedInUser = req.user as LoggedInUserType;
    return this.addressService.createAddress(loggedInUser.id, data);
  }

  @UseInterceptors(NoFilesInterceptor())
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  editAddress(@Param() params: any, @Body() data: AddressUpdateType) {
    return this.addressService.editAddress(+params.id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/userAddress')
  getUserAddress(@Req() req) {
    const loggedInUser = req.user as LoggedInUserType;
    return this.addressService.getUserAddress(loggedInUser.id);
  }

  @UseInterceptors(NoFilesInterceptor())
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteAddress(@Param() params: any, @Req() req) {
    return this.addressService.deleteUserAddress(+params.id);
  }
}
