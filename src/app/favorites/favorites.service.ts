import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async toggleProductFavorite(userId: number, productId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: +userId },
      include: {
        favoritesProducts: {
          where: { id: +productId },
          select: { id: true },
        },
      },
    });

    const alreadyFavorited = user?.favoritesProducts?.some(
      (p) => p.id === +productId,
    );

    await this.prisma.user.update({
      where: { id: +userId },
      data: {
        favoritesProducts: alreadyFavorited
          ? { disconnect: { id: +productId } }
          : { connect: { id: +productId } },
      },
      select: {
        favoritesProducts: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return alreadyFavorited
      ? { message: 'product removed' }
      : { message: 'product added' };
  }

  async toggleVendorFavorite(userId: number, vendorId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: +userId },
      include: {
        favoritesVendors: {
          where: { id: +vendorId },
          select: { id: true },
        },
      },
    });

    const alreadyFavorited = user?.favoritesVendors?.some(
      (v) => v.id === +vendorId,
    );

    await this.prisma.user.update({
      where: { id: +userId },
      data: {
        favoritesVendors: alreadyFavorited
          ? { disconnect: { id: +vendorId } }
          : { connect: { id: +vendorId } },
      },
      select: {
        favoritesVendors: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return alreadyFavorited
      ? { message: 'vendor removed' }
      : { message: 'vendor added' };
  }

  async getFavoriteProductsAndVendors(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: +userId },
      select: {
        favoritesProducts: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            available: true,
          },
        },
        favoritesVendors: {
          select: {
            id: true,
            name: true,
            cover: true,
            deliveryCost: true,
            deliveryCostOffer: true,
            rate: true,
            pickUp: true,
            hasOffer: true,
            offerName: true,
          },
        },
      },
    });
    return {
      products: user?.favoritesProducts ?? [],
      vendors: user?.favoritesVendors ?? [],
    };
  }
}
