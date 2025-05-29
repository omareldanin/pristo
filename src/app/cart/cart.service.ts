import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async addToCart(
    userId: number,
    data: { productId: number; quantity: number; groups: any },
  ) {
    let total = 0,
      subtotal = 0,
      shipping = 0,
      quantity = 0;

    let cart = await this.prisma.cart.findFirst({
      where: {
        userId: +userId,
      },
    });
    //check if no cart for user and create it if true---
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          user: {
            connect: {
              id: +userId,
            },
          },
        },
      });
    }

    total += +cart.total;
    subtotal += +cart.subtotal;
    shipping += +cart.shipping;
    quantity += +cart.quantity;

    const product = await this.prisma.product.findUnique({
      where: {
        id: +data.productId,
      },
      select: {
        id: true,
        vendorId: true,
        Vendor: {
          select: {
            deliveryCost: true,
            deliveryCostOffer: true,
            hasOffer: true,
          },
        },
        available: true,
        price: true,
        groups: {
          select: {
            id: true,
            name: true,
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

    if (cart.vendorId && product.vendorId !== cart.vendorId) {
      throw new BadRequestException(
        'لا يمكنك الطلب من مطاعم مختلفه في نفس السله , قم بمسح السله؟',
      );
    }
    if (!product || !product.available) {
      throw new BadRequestException('هذا المنتج غير متاح');
    }

    let groupsTotal = 0;
    let groupObject = { groups: [] };

    data.groups.forEach((group) => {
      const selectedGroup = product.groups.find(
        (g) => +g.id === +group.groupId,
      );

      group.options.forEach((op) => {
        const option = selectedGroup.options.find((o) => o.id === +op);
        groupsTotal += +option.price;
      });

      groupObject.groups.push({
        id: selectedGroup.id,
        name: selectedGroup.name,
        options: group.options.map((op) => {
          const option = selectedGroup.options.find((o) => o.id === +op);
          return {
            id: option.id,
            name: option.name,
            price: option.price,
          };
        }),
      });
    });
    shipping = +product.Vendor.deliveryCost;
    if (product.Vendor.hasOffer) {
      shipping += +product.Vendor.deliveryCostOffer;
    }
    subtotal += +product.price * +data.quantity;
    subtotal += +groupsTotal * +data.quantity;

    total += +product.price * +data.quantity;
    total += +groupsTotal * +data.quantity;
    quantity += +data.quantity;

    await this.prisma.cart.update({
      where: {
        id: cart.id,
      },
      data: {
        total: cart.shipping ? total : total + shipping,
        shipping,
        subtotal,
        quantity,
        vendor: {
          connect: {
            id: product.vendorId,
          },
        },
      },
    });

    const cartProduct = await this.prisma.cartProduct.create({
      data: {
        product: {
          connect: {
            id: +product.id,
          },
        },
        Cart: {
          connect: {
            id: cart.id,
          },
        },
        quantity: +data.quantity,
        subtotal: +product.price + +groupsTotal,
        total: (+product.price + +groupsTotal) * +data.quantity,
        groups: groupObject,
      },
    });

    return cartProduct;
  }

  async getUserCart(userId: number) {
    let cart = await this.prisma.cart.findFirst({
      where: {
        userId: +userId,
      },
      select: {
        id: true,
        total: true,
        shipping: true,
        subtotal: true,
        quantity: true,
        vendor: {
          select: {
            id: true,
            name: true,
            cover: true,
          },
        },
        products: {
          select: {
            id: true,
            total: true,
            quantity: true,
            subtotal: true,
            product: {
              select: {
                id: true,
                image: true,
                name: true,
                price: true,
              },
            },
            groups: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          user: {
            connect: {
              id: +userId,
            },
          },
        },
        select: {
          id: true,
          total: true,
          shipping: true,
          subtotal: true,
          quantity: true,
          vendor: {
            select: {
              id: true,
              name: true,
              cover: true,
            },
          },
          products: {
            select: {
              id: true,
              total: true,
              quantity: true,
              subtotal: true,
              product: {
                select: {
                  id: true,
                  image: true,
                  name: true,
                  price: true,
                },
              },
              groups: true,
            },
          },
        },
      });
    }
    return cart;
  }

  async deleteCartProduct(cartProductId: number) {
    const cartProduct = await this.prisma.cartProduct.findUnique({
      where: {
        id: +cartProductId,
      },
      select: {
        total: true,
        quantity: true,
        Cart: {
          select: {
            id: true,
            total: true,
            subtotal: true,
            quantity: true,
            vendorId: true,
            products: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    await this.prisma.cart.update({
      where: {
        id: cartProduct.Cart.id,
      },
      data: {
        total:
          cartProduct.Cart.products.length === 1
            ? 0
            : cartProduct.Cart.total - cartProduct.total,
        subtotal: cartProduct.Cart.subtotal - cartProduct.total,
        quantity: cartProduct.Cart.quantity - cartProduct.quantity,
        shipping: cartProduct.Cart.products.length === 1 ? 0 : undefined,
        vendor:
          cartProduct.Cart.products.length === 1
            ? {
                disconnect: {
                  id: cartProduct.Cart.vendorId,
                },
              }
            : undefined,
      },
    });

    await this.prisma.cartProduct.delete({
      where: {
        id: +cartProductId,
      },
    });
    return { message: 'success' };
  }

  async updateCartProduct(
    cartProductId: number,
    data: { quantity: number; groups: any },
  ) {
    let total = 0,
      subtotal = 0,
      quantity = 0;

    if (+data.quantity === 0) {
      const result = await this.deleteCartProduct(cartProductId);
      return result;
    }

    const cartProduct = await this.prisma.cartProduct.findUnique({
      where: {
        id: +cartProductId,
      },
      select: {
        id: true,
        subtotal: true,
        total: true,
        quantity: true,
        product: {
          select: {
            id: true,
            price: true,
            groups: {
              select: {
                id: true,
                name: true,
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
        },
        Cart: {
          select: {
            id: true,
            total: true,
            subtotal: true,
            quantity: true,
            vendorId: true,
            products: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    total = cartProduct.Cart.total - cartProduct.total;
    subtotal = cartProduct.Cart.subtotal - cartProduct.total;
    quantity = cartProduct.Cart.quantity - cartProduct.quantity;

    let groupsTotal = 0;
    let groupObject = { groups: [] };

    data.groups.forEach((group) => {
      const selectedGroup = cartProduct.product.groups.find(
        (g) => +g.id === +group.groupId,
      );

      group.options.forEach((op) => {
        const option = selectedGroup.options.find((o) => o.id === +op);
        groupsTotal += +option.price;
      });

      groupObject.groups.push({
        id: selectedGroup.id,
        name: selectedGroup.name,
        options: group.options.map((op) => {
          const option = selectedGroup.options.find((o) => o.id === +op);
          return {
            id: option.id,
            name: option.name,
            price: option.price,
          };
        }),
      });
    });

    subtotal += +cartProduct.product.price * +data.quantity;
    subtotal += +groupsTotal * +data.quantity;

    total += +cartProduct.product.price * +data.quantity;
    total += +groupsTotal * +data.quantity;
    quantity += +data.quantity;

    await this.prisma.cart.update({
      where: {
        id: cartProduct.Cart.id,
      },
      data: {
        total: total,
        subtotal,
        quantity,
      },
    });

    const updatedCartProduct = await this.prisma.cartProduct.update({
      where: {
        id: +cartProductId,
      },
      data: {
        quantity: +data.quantity,
        subtotal: +cartProduct.product.price + +groupsTotal,
        total: (+cartProduct.product.price + +groupsTotal) * +data.quantity,
        groups: groupObject,
      },
    });

    return updatedCartProduct;
  }
}
