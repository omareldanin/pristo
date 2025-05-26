import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MainCategoryService } from '../main-category/main-category.service';
import { BannerService } from '../banner/banner.service';
import { HomeCategoryService } from '../home-category/home-category.service';

@Injectable()
export class SharedService {
  constructor(
    private prisma: PrismaService,
    private mainCategoryService: MainCategoryService,
    private banners: BannerService,
    private homeCategoryService: HomeCategoryService,
  ) {}

  async getHomePage(filters: { longitudes: string; latitude: string }) {
    const banners = await this.banners.getAllBanners();
    const mainCategories =
      await this.mainCategoryService.getAllMainCategories();
    const homeCategories =
      await this.homeCategoryService.getAllHomeCategories();

    return {
      banners,
      mainCategories,
      homeCategories,
    };
  }
}
