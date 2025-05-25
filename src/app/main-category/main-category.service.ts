import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  MainCategoryCreateType,
  MainCategoryUpdateType,
} from './mainCategory.dto';
import { MainCategory } from '@prisma/client';

function safeParseJson(input: string): any {
  try {
    return JSON.parse(input);
  } catch (e) {
    throw new BadRequestException('Invalid JSON format for name/description');
  }
}

@Injectable()
export class MainCategoryService {
  constructor(private prisma: PrismaService) {}

  async createCategory(data: MainCategoryCreateType): Promise<MainCategory> {
    const category = await this.prisma.mainCategory.create({
      data: {
        name: safeParseJson(data.name),
        description: safeParseJson(data.description),
        active: data.active,
        image: data.image,
        createdBy: data.createdBy,
      },
    });

    return category;
  }

  async getAllMainCategories(): Promise<{ results: MainCategory[] }> {
    const result = await this.prisma.mainCategory.findMany();

    return { results: result };
  }

  async updateCategory(
    id: number,
    data: MainCategoryUpdateType,
  ): Promise<MainCategory> {
    const category = await this.prisma.mainCategory.update({
      where: {
        id: +id,
      },
      data: {
        name: data.name ? safeParseJson(data.name) : undefined,
        image: data.image,
        description: data.description
          ? safeParseJson(data.description)
          : undefined,
        active: data.active,
      },
    });

    return category;
  }

  async deactiveCategory(data: {
    id: number;
    deleteBy: string;
  }): Promise<MainCategory> {
    const category = await this.prisma.mainCategory.update({
      where: {
        id: +data.id,
      },
      data: {
        deleted: true,
        deletedBy: data.deleteBy,
      },
    });

    return category;
  }

  async reactiveCategory(data: { id: number }): Promise<MainCategory> {
    const category = await this.prisma.mainCategory.update({
      where: {
        id: +data.id,
      },
      data: {
        deleted: true,
      },
    });

    return category;
  }
}
