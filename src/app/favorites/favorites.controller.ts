import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/middlewares/jwt-auth.guard';
import { LoggedInUserType } from '../auth/auth.dto';

@Controller('favorites')
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @UseInterceptors(NoFilesInterceptor())
  @UseGuards(JwtAuthGuard)
  @Post('/toggleProduct')
  toggleProduct(@Body() data: { productId: number }, @Req() req) {
    const loggedInUser = req.user as LoggedInUserType;
    const result = this.favoritesService.toggleProductFavorite(
      +loggedInUser.id,
      +data.productId,
    );

    return result;
  }

  @UseInterceptors(NoFilesInterceptor())
  @UseGuards(JwtAuthGuard)
  @Post('/toggleVendor')
  toggleVendor(@Body() data: { vendorId: number }, @Req() req) {
    const loggedInUser = req.user as LoggedInUserType;
    const result = this.favoritesService.toggleVendorFavorite(
      +loggedInUser.id,
      +data.vendorId,
    );

    return result;
  }

  @UseInterceptors(NoFilesInterceptor())
  @UseGuards(JwtAuthGuard)
  @Get('/getUserFavorite')
  getUserFavorite(@Req() req) {
    const loggedInUser = req.user as LoggedInUserType;
    const result = this.favoritesService.getFavoriteProductsAndVendors(
      +loggedInUser.id,
    );

    return result;
  }
}
