import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ComplainService {
  constructor(private prisma: PrismaService) {}

  async createComplain(data: {
    userId: number;
    title: string;
    description: string;
  }) {
    const complain = await this.prisma.complain.create({
      data: {
        title: data.title,
        description: data.description,
        user: {
          connect: {
            id: +data.userId,
          },
        },
      },
    });

    return complain;
  }

  async getAllComplains(filter: { size: number; page: number }) {
    const page = +filter.page || 1;
    const pageSize = +filter.size || 10;

    const [results, total] = await Promise.all([
      this.prisma.complain.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              fcm: true,
            },
          },
        },
        skip: (page - 1) * +pageSize,
        take: +pageSize,
      }),
      this.prisma.notification.count(),
    ]);

    return {
      count: total,
      page,
      totalPages: Math.ceil(total / pageSize),
      results: results,
    };
  }

  async deleteComplain(id: number) {
    await this.prisma.complain.delete({
      where: {
        id: +id,
      },
    });

    return { message: 'success' };
  }
}
