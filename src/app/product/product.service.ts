import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductCreateType, ProductUpdateType } from './product.dto';
import { Prisma } from '@prisma/client';
import { vendorReform, vendorSelect } from '../vendors/vendor.response';

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
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async createProduct(data: ProductCreateType) {
    const product = await this.prisma.product.create({
      data: {
        name: safeParseJson(data.name),
        description: safeParseJson(data.description),
        price: +data.price,
        image: data.image,
        available: data.available,
        Vendor: {
          connect: {
            id: +data.vendorId,
          },
        },
        ProductCategory: {
          connect: {
            id: +data.productCategoryId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        price: true,
        image: true,
      },
    });

    return product;
  }

  async getProducts(filters: {
    page: number;
    size: number;
    vendorId: number;
    productCategoryId: number;
    name: string;
    orders: string;
  }) {
    const page = +filters.page || 1;
    const pageSize = +filters.size || 10;

    const where = {
      vendorId: filters.vendorId ? +filters.vendorId : undefined,
      productCategoryId: filters.productCategoryId
        ? +filters.productCategoryId
        : undefined,
    } satisfies Prisma.ProductWhereInput;

    const [results, total] = await Promise.all([
      this.prisma.product.findMany({
        where: where,
        skip: (page - 1) * +pageSize,
        take: +pageSize,
        orderBy:
          filters.orders === 'true'
            ? {
                orders: 'desc',
              }
            : {
                id: 'asc',
              },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          available: true,
          image: true,
          ProductCategory: {
            select: {
              id: true,
              name: true,
            },
          },
          Vendor: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.product.count({
        where: where,
      }),
    ]);

    return {
      count: total,
      page,
      totalPages: Math.ceil(total / pageSize),
      results: results,
    };
  }

  async getVendorWithProducts(vendorId: number) {
    const vendorData = await this.prisma.user.findUnique({
      where: {
        id: +vendorId,
      },
      select: vendorSelect,
    });

    const reformedVendor = vendorReform(vendorData);

    const mostOrders = await this.prisma.product.findMany({
      where: {
        vendorId: +vendorId,
      },
      select: {
        id: true,
        name: true,
        price: true,
        available: true,
        image: true,
      },
      skip: 0,
      take: 10,
      orderBy: {
        orders: 'desc',
      },
    });

    const products = await this.prisma.productCategory.findMany({
      where: {
        mainCategoryId: vendorData.mainCategoryId,
        products: {
          some: {},
        },
      },
      select: {
        name: true,
        products: {
          where: {
            vendorId: +vendorId,
          },
          select: {
            id: true,
            name: true,
            price: true,
            available: true,
            image: true,
          },
        },
      },
    });
    return { vendor: reformedVendor, mostOrders, all: products };
  }
  async getOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: {
        id: +id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        available: true,
        image: true,
        ProductCategory: {
          select: {
            id: true,
            name: true,
          },
        },
        Vendor: {
          select: {
            id: true,
            name: true,
          },
        },
        groups: {
          select: {
            id: true,
            name: true,
            multi: true,
            options: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    return { product };
  }

  async searchByName(name: string) {
    const searchTerm = `%${name.toLowerCase()}%`;
    const results = await this.prisma.$queryRawUnsafe(
      `
        SELECT 
          v.id AS "vendorId",
          v.name AS "name",
          v.cover AS "cover",
          json_agg(p.*) AS products
        FROM "Product" p
        JOIN "Vendor" v ON p."vendorId" = v.id
        WHERE 
          LOWER(p.name->>'en') LIKE $1 OR
          LOWER(p.name->>'ar') LIKE $1 OR
          LOWER(p.name->>'fr') LIKE $1
        GROUP BY v.id
      `,
      searchTerm,
    );

    return results;
  }

  async editOne(id: number, data: ProductUpdateType) {
    const product = await this.prisma.product.update({
      where: {
        id: +id,
      },
      data: {
        name: data.name ? safeParseJson(data.name) : undefined,
        description: data.description
          ? safeParseJson(data.description)
          : undefined,
        price: data.price ? +data.price : undefined,
        available:
          data.available === true
            ? true
            : data.available === false
              ? false
              : undefined,
        ProductCategory: data.productCategoryId
          ? {
              connect: {
                id: +data.productCategoryId,
              },
            }
          : undefined,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        available: true,
        ProductCategory: {
          select: {
            id: true,
            name: true,
          },
        },
        Vendor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return { product };
  }

  async deleteOne(id: number) {
    await this.prisma.product.delete({
      where: {
        id: +id,
      },
    });

    return { message: 'deleted' };
  }

  async createGroupWithOptions(productId: number, groupData: any) {
    const group = await this.prisma.group.create({
      data: {
        name: safeParseJson(groupData.name),
        multi: groupData.multi,
        Product: {
          connect: {
            id: +productId,
          },
        },
        options: {
          createMany: {
            data: groupData.options.map((option) => ({
              name: safeParseJson(option.name),
              price: option.price,
            })),
          },
        },
      },
    });

    return group;
  }

  async editGroupWithOptions(groupId: number, groupData: any) {
    const group = await this.prisma.group.update({
      where: {
        id: +groupId,
      },
      data: {
        name: safeParseJson(groupData.name),
        multi: groupData.multi,
        options: {
          deleteMany: {
            groupId: +groupId,
          },
          createMany: {
            data: groupData.options.map((option) => ({
              name: safeParseJson(option.name),
              price: option.price,
            })),
          },
        },
      },
    });

    return group;
  }

  async deleteGroup(groupId: number) {
    await this.prisma.group.delete({
      where: {
        id: +groupId,
      },
    });

    return { message: 'success' };
  }

  async deleteOption(id: number) {
    await this.prisma.option.delete({
      where: {
        id: +id,
      },
    });

    return { message: 'success' };
  }
}
