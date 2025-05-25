import { Injectable } from '@nestjs/common';
import { Banner } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BannerService {
  constructor(private prisma: PrismaService) {}

  async createBanner(data: {
    createdBy: string;
    image: string | undefined;
    order: number;
  }): Promise<Banner> {
    return await this.prisma.banner.create({
      data: {
        createdBy: data.createdBy,
        image: data.image,
        order: +data.order,
      },
    });
  }

  async getAllBanners(): Promise<{ count: number; results: Banner[] }> {
    const results = await this.prisma.banner.findMany({
      orderBy: {
        order: 'asc',
      },
    });

    return { count: results.length, results };
  }

  async editBanner(data: {
    id: number;
    order?: number | undefined;
    active?: boolean | undefined;
  }): Promise<Banner> {
    return await this.prisma.banner.update({
      where: {
        id: data.id,
      },
      data: {
        order: +data.order,
        active: data.active,
      },
    });
  }

  async deleteBanner(id: number): Promise<{ message: string }> {
    await this.prisma.banner.delete({
      where: {
        id,
      },
    });

    return { message: 'تم الحذف بنجاح' };
  }
}
