import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  VendorCreateType,
  VendorFiltersType,
  VendorUpdateType,
} from './vendor.dto';
import * as bcrypt from 'bcrypt';
import { env } from 'src/config';
import { Prisma, VendorStatus } from '@prisma/client';
import { vendorReform, vendorSelect } from './vendor.response';

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
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  async createVendor(data: { vendorData: VendorCreateType }) {
    const checkifExist = await this.prisma.user.findFirst({
      where: {
        phone: data.vendorData.phone,
      },
      select: { id: true },
    });

    if (checkifExist) {
      throw new ConflictException('رقم الهاتف موجود');
    }

    const hashedPassword = bcrypt.hashSync(
      data.vendorData.password + (env.PASSWORD_SALT as string),
      12,
    );

    const vendor = await this.prisma.vendor.create({
      data: {
        user: {
          create: {
            name: safeParseJson(data.vendorData.name)?.ar,
            avatar: 'uploads/' + data.vendorData.avatar,
            phone: data.vendorData.phone,
            password: hashedPassword,
            role: 'VENDOR',
            token: '',
            MainCategory: {
              connect: {
                id: +data.vendorData.mainCategoryId,
              },
            },
            homeCategory: {
              connect: {
                id: +data.vendorData.homeCategoryId,
              },
            },
            SubCategory: {
              connect: {
                id: +data.vendorData.subCategoryId,
              },
            },
          },
        },
        name: safeParseJson(data.vendorData.name),
        weekTimes: data.vendorData.weekTimes
          ? safeParseJson(data.vendorData.weekTimes)
          : undefined,
        offerName: data.vendorData.offerName
          ? safeParseJson(data.vendorData.offerName)
          : undefined,
        cover: 'uploads/' + data.vendorData.cover,
        status: data.vendorData.status,
        latitude: data.vendorData.latitude,
        longitudes: data.vendorData.longitudes,
        feature: data.vendorData.feature,
        active: data.vendorData.active,
        deliveryCost: data.vendorData.deliveryCost,
        deliveryCostOffer: data.vendorData.deliveryCostOffer,
        hasOffer: data.vendorData.hasOffer,
        orderTime: data.vendorData.orderTime,
        pickUp: data.vendorData.pickUp,
      },
    });

    return vendor;
  }

  async getAllVendors(filters: VendorFiltersType) {
    const page = +filters.page || 1;
    const pageSize = +filters.size || 10000;

    const where = {
      role: 'VENDOR',
      phone: {
        contains: filters.phone,
        mode: 'insensitive',
      },
      SubCategory: filters.subCategoryId?.length
        ? {
            id: { in: filters.subCategoryId },
          }
        : undefined,
      mainCategoryId: +filters.mainCategoryId || undefined,
      homeCategoryId: +filters.homeCategoryId || undefined,
      vendor: {
        status: filters.status || undefined,
        feature: filters.feature,
        active: filters.active,
        pickUp: filters.pickUp,
      },
    } satisfies Prisma.UserWhereInput;

    const [results, total] = await Promise.all([
      this.prisma.user.findMany({
        where: where,
        select: vendorSelect,
        orderBy: {
          vendor: filters.rate
            ? {
                rate: 'desc',
              }
            : filters.time
              ? {
                  orderTime: 'asc',
                }
              : {
                  id: 'asc',
                },
        },
        skip: (page - 1) * +pageSize,
        take: +pageSize,
      }),
      this.prisma.user.count({
        where: where,
      }),
    ]);

    return {
      count: total,
      page,
      totalPages: Math.ceil(total / pageSize),
      results: results.map((v) => vendorReform(v)),
    };
  }

  async getOne(id: number) {
    const vendor = await this.prisma.user.findUnique({
      where: { id: +id },
      select: vendorSelect,
    });

    return {
      results: vendorReform(vendor),
    };
  }

  async updateVendor(data: { id: number; vendorData: VendorUpdateType }) {
    const vendor = await this.prisma.user.update({
      where: {
        id: +data.id,
      },
      data: {
        phone: data.vendorData.phone,
        password: data.vendorData.password
          ? bcrypt.hashSync(
              data.vendorData.password + (env.PASSWORD_SALT as string),
              12,
            )
          : undefined,
        avatar: data.vendorData.avatar
          ? 'uploads/' + data.vendorData.avatar
          : undefined,
        MainCategory: data.vendorData.mainCategoryId
          ? {
              connect: {
                id: +data.vendorData.mainCategoryId,
              },
            }
          : undefined,
        homeCategory: data.vendorData.homeCategoryId
          ? {
              connect: {
                id: +data.vendorData.homeCategoryId,
              },
            }
          : undefined,
        SubCategory: data.vendorData.subCategoryId
          ? {
              connect: {
                id: +data.vendorData.subCategoryId,
              },
            }
          : undefined,
        vendor: {
          update: {
            data: {
              name: data.vendorData.name
                ? safeParseJson(data.vendorData.name)
                : undefined,
              weekTimes: data.vendorData.weekTimes
                ? safeParseJson(data.vendorData.weekTimes)
                : undefined,
              offerName: data.vendorData.offerName
                ? safeParseJson(data.vendorData.offerName)
                : undefined,
              cover: data.vendorData.cover
                ? 'uploads/' + data.vendorData.cover
                : undefined,
              status: data.vendorData.status,
              latitude: data.vendorData.latitude,
              longitudes: data.vendorData.longitudes,
              feature: data.vendorData.feature,
              active: data.vendorData.active,
              deliveryCost: data.vendorData.deliveryCost,
              deliveryCostOffer: data.vendorData.deliveryCostOffer,
              hasOffer: data.vendorData.hasOffer,
              orderTime: data.vendorData.orderTime,
              pickUp: data.vendorData.pickUp,
            },
          },
        },
      },
    });

    return vendor;
  }

  async deleteVendor(id: number) {
    await this.prisma.vendor.delete({
      where: {
        id: +id,
      },
    });
    await this.prisma.user.delete({
      where: {
        id: +id,
      },
    });

    return { message: 'تم المسح بنجاح' };
  }
}
