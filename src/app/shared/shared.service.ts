import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MainCategoryService } from '../main-category/main-category.service';
import { BannerService } from '../banner/banner.service';
import { HomeCategoryService } from '../home-category/home-category.service';
import { ChatGateway } from 'src/order.gateway';

@Injectable()
export class SharedService {
  constructor(
    private prisma: PrismaService,
    private mainCategoryService: MainCategoryService,
    private banners: BannerService,
    private homeCategoryService: HomeCategoryService,
    private chatGateway: ChatGateway,
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

  async createOption(data: { name: string; content: string; active: boolean }) {
    const option = await this.prisma.general.create({
      data: {
        name: data.name,
        content: data.content,
        active: data.active,
      },
    });
    return { result: option };
  }

  async editOption(data: { name: string; content: string; active: boolean }) {
    const option = await this.prisma.general.updateManyAndReturn({
      where: {
        name: data.name,
      },
      data: {
        name: data.name,
        content: data.content,
        active: data.active,
      },
    });
    const options = await this.returnOptions();
    this.chatGateway.emitOptionUpdated(`users`, { results: options });

    return { result: option };
  }

  async returnOptions() {
    const options = await this.prisma.general.findMany();

    return { results: options };
  }
}
