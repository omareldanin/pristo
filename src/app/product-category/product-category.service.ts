import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

function safeParseJson(input: string): any {
  if (typeof input === 'object') {
    return input; // already parsed
  }
  try {
    return JSON.parse(input);
  } catch (e) {
    throw new BadRequestException('Invalid JSON format for name/description');
  }
}

@Injectable()
export class ProductCategoryService {
  constructor(private prisma: PrismaService) {}

  async createCategory(data: { name: string; mainCategoryId: number }) {
    const category = await this.prisma.productCategory.create({
      data: {
        name: safeParseJson(data.name),
        MainCategory: {
          connect: {
            id: +data.mainCategoryId,
          },
        },
      },
    });

    return category;
  }

  async getAllCategories(mainCategoryId: number | undefined) {
    const results = await this.prisma.productCategory.findMany({
      where: {
        mainCategoryId: mainCategoryId ? +mainCategoryId : undefined,
      },
      select: {
        id: true,
        name: true,
        MainCategory: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return { results };
  }

  async editOne(data: {
    id: number;
    name: string | undefined;
    mainCategoryId: number | undefined;
  }) {
    const category = await this.prisma.productCategory.update({
      where: {
        id: +data.id,
      },
      data: {
        name: data.name ? safeParseJson(data.name) : undefined,
        MainCategory: data.mainCategoryId
          ? {
              connect: {
                id: +data.mainCategoryId,
              },
            }
          : undefined,
      },
    });

    return category;
  }

  async deleteOne(id: number) {
    await this.prisma.productCategory.delete({
      where: {
        id: +id,
      },
    });

    return { message: 'تم المسح بنجاح' };
  }
}
