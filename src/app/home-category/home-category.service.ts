import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  HomeCategoryCreateType,
  HomeCategoryUpdateType,
} from './homeCategory.dto';
import { HomeCategory } from '@prisma/client';
import { categoryReform, categorySelect } from './home-category.response';

function safeParseJson(input: string): any {
  try {
    return JSON.parse(input);
  } catch (e) {
    throw new BadRequestException('Invalid JSON format for name/description');
  }
}

@Injectable()
export class HomeCategoryService {
  constructor(private prisma: PrismaService) {}

  async createCategory(data: HomeCategoryCreateType): Promise<HomeCategory> {
    const category = await this.prisma.homeCategory.create({
      data: {
        name: safeParseJson(data.name),
        order: +data.order,
        active: data.active,
        image: data.image,
      },
    });

    return category;
  }

  async getAllHomeCategories() {
    const result = await this.prisma.homeCategory.findMany({
      select: categorySelect,
    });

    return { results: result.map((c) => categoryReform(c)) };
  }

  async getOnHomeCategory(id: number) {
    const result = await this.prisma.homeCategory.findUnique({
      where: {
        id: +id,
      },
      select: categorySelect,
    });

    return { results: categoryReform(result) };
  }

  async updateCategory(id: number, data: HomeCategoryUpdateType) {
    const category = await this.prisma.homeCategory.update({
      where: {
        id: +id,
      },
      data: {
        name: data.name ? safeParseJson(data.name) : undefined,
        order: data.order,
        image: data.image,
        active: data.active,
      },
    });

    return category;
  }

  async deleteCategory(id: number) {
    await this.prisma.homeCategory.delete({
      where: {
        id: +id,
      },
    });

    return { message: 'تم المسح بنجاح' };
  }
}
