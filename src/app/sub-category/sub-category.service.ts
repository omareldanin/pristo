import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

function safeParseJson(input: string): any {
  try {
    return JSON.parse(input);
  } catch (e) {
    throw new BadRequestException('Invalid JSON format for name/description');
  }
}

@Injectable()
export class SubCategoryService {
  constructor(private prisma: PrismaService) {}

  async createCategory(data: {
    name: string;
    image: string;
    mainCategoryId: number;
  }) {
    const category = await this.prisma.subCategory.create({
      data: {
        name: safeParseJson(data.name),
        image: data.image,
        mainCategory: {
          connect: {
            id: +data.mainCategoryId,
          },
        },
      },
    });

    return category;
  }

  async getAllSubCategories(mainCategoryId: number | undefined) {
    const results = await this.prisma.subCategory.findMany({
      where: {
        mainCategoryId: +mainCategoryId || undefined,
      },
      select: {
        id: true,
        name: true,
        image: true,
        mainCategory: {
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
    image: string | undefined;
    mainCategoryId: number | undefined;
  }) {
    const category = await this.prisma.subCategory.update({
      where: {
        id: +data.id,
      },
      data: {
        name: safeParseJson(data.name),
        image: data.image,
        mainCategory: data.mainCategoryId
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
    await this.prisma.subCategory.delete({
      where: {
        id: +id,
      },
    });

    return { message: 'تم المسح بنجاح' };
  }
}
