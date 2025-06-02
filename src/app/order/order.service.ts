import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { checkIfOpen } from '../vendors/vendor.response';
import { NotificationService } from '../notification/notification.service';
import { TransactionsService } from '../transactions/transactions.service';
import { OrderStatus } from '@prisma/client';
import { ChatGateway } from 'src/order.gateway';

const orderStatusArabicNames = {
  REGISTERED: 'تم الطلب',
  RECEIVED: 'تم استلام الطلب',
  PREPARING: 'يتم التحضير',
  FINISHED: 'تم الانتهاء من التحضير',
  TACKED: 'المندوب جاهز',
  WITH_DELIVERY: 'الطلب مع المندوب',
  COMPLETE: 'تم التوصيل',
  CANCELED: 'مرفوض',
  DELETED: 'تم المسح',
};

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private cart: CartService,
    private notification: NotificationService,
    private transaction: TransactionsService,
    private chatGateway: ChatGateway,
  ) {}

  async createOrder(
    userId: number,
    data: { addressId: number; paymentMethod: string },
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: +userId,
      },
      select: {
        wallet: true,
      },
    });

    const cart = await this.cart.getUserCart(+userId);

    if (cart.products.length === 0) {
      throw new BadRequestException('لا يوجد منتجات في السله');
    }

    if (data.paymentMethod === 'wallet' && +user.wallet < +cart.total) {
      throw new BadRequestException('لا يوجد رصيد كافي');
    }

    const vendorIsOPEND = checkIfOpen(cart.vendor.weekTimes);

    if (vendorIsOPEND === 'CLOSED') {
      throw new BadRequestException('المطعم مغلق حاليا');
    }

    const order = await this.prisma.order.create({
      data: {
        total: cart.total,
        subtotal: cart.subtotal,
        shipping: cart.shipping,
        quantity: cart.quantity,
        paymentMethod: data.paymentMethod,
        time: cart.vendor.orderTime,
        status: 'REGISTERED',
        User: {
          connect: {
            id: +userId,
          },
        },
        Vendor: {
          connect: {
            id: cart.vendor.id,
          },
        },
        UserAddresses: {
          connect: {
            id: +data.addressId,
          },
        },
      },
    });

    if (data.paymentMethod === 'wallet') {
      await this.transaction.createTransaction(
        `انشاء طلب جديد برقم ${order.id}`,
        { amount: +order.total, userId: +userId, type: 'WITHDRAW' },
      );
    }

    await this.prisma.cartProduct.updateMany({
      where: {
        cartId: cart.id,
      },
      data: {
        ordered: true,
        orderId: order.id,
        cartId: null,
      },
    });

    await this.prisma.cart.update({
      where: {
        id: cart.id,
      },
      data: {
        total: 0,
        shipping: 0,
        subtotal: 0,
        quantity: 0,
        vendor: {
          disconnect: {
            id: cart.vendor.id,
          },
        },
      },
    });

    // send notification to vendor---------------------
    await this.notification.sendNotification({
      title: `هناك طلب جديد برقم ${order.id}`,
      content: `هناك طلب جديد برقم ${order.id}`,
      userId: +userId,
      topic: undefined,
    });

    await this.prisma.orderTimeLine.create({
      data: {
        content: 'تم انشاء الطلب',
        Order: {
          connect: {
            id: order.id,
          },
        },
      },
    });
    this.chatGateway.emitOrderCreated(`vendor_${order.vendorId}`, order);
    this.chatGateway.emitOrderCreated(`admins`, order);
    return order;
  }

  async getOneOrder(orderId: number) {
    const order = this.prisma.order.findUnique({
      where: {
        id: +orderId,
      },
      select: {
        id: true,
        total: true,
        subtotal: true,
        shipping: true,
        quantity: true,
        status: true,
        createdAt: true,
        paymentMethod: true,
        time: true,
        UserAddresses: {
          select: {
            id: true,
            name: true,
            latitude: true,
            longitudes: true,
          },
        },
        User: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        Vendor: {
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
        orderTimeLines: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });
    return order;
  }

  async getAllOrders(filters: {
    status: OrderStatus | undefined;
    vendorId: number | undefined;
    deliverId: number | undefined;
    page: number | undefined;
    size: number | undefined;
    userId: number | undefined;
  }) {
    const page = +filters.page || 1;
    const pageSize = +filters.size || 10;

    const [results, total] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          status: filters.status ? filters.status : undefined,
          vendorId: filters.vendorId ? +filters.vendorId : undefined,
          deliveryId: filters.deliverId ? +filters.deliverId : undefined,
          userId: filters.userId ? +filters.userId : undefined,
          deleted: false,
        },
        select: {
          id: true,
          total: true,
          subtotal: true,
          shipping: true,
          quantity: true,
          status: true,
          createdAt: true,
          paymentMethod: true,
          time: true,
          UserAddresses: {
            select: {
              id: true,
              name: true,
              latitude: true,
              longitudes: true,
            },
          },
          User: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          Vendor: {
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
          orderTimeLines: {
            select: {
              id: true,
              content: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * +pageSize,
        take: +pageSize,
      }),
      this.prisma.order.count({
        where: {
          status: filters.status ? filters.status : undefined,
          vendorId: filters.vendorId ? +filters.vendorId : undefined,
          deliveryId: filters.deliverId ? +filters.deliverId : undefined,
          userId: filters.userId ? +filters.userId : undefined,
          deleted: false,
        },
      }),
    ]);

    return {
      count: total,
      page,
      totalPages: Math.ceil(total / pageSize),
      results: results,
    };
  }

  async updateOrder(
    orderId: number,
    data: {
      status: OrderStatus | undefined;
      time: number | undefined;
      deliveryAgentId: number | undefined;
    },
  ) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: +orderId,
      },
    });

    if (order.deliveryId && data.deliveryAgentId) {
      throw new BadRequestException('لا يمكنك حجز الطلب؟');
    }

    const updatedOrder = await this.prisma.order.update({
      where: {
        id: +orderId,
      },
      data: {
        status: data.status ? data.status : undefined,
        time: data.time ? +data.time : undefined,
        Delivery: data.deliveryAgentId
          ? {
              connect: {
                id: +data.deliveryAgentId,
              },
            }
          : undefined,
      },
    });

    if (data.status) {
      await this.prisma.orderTimeLine.create({
        data: {
          content: `تم تغيير حاله الطلب رقم  ${order.id} الى ${orderStatusArabicNames[data.status]}`,
          Order: {
            connect: {
              id: +order.id,
            },
          },
        },
      });
      await this.notification.sendNotification({
        title: `تم تغيير حاله الطلب رقم  ${order.id} الى ${orderStatusArabicNames[data.status]}`,
        content: `تم تغيير حاله الطلب رقم  ${order.id} الى ${orderStatusArabicNames[data.status]}`,
        userId: order.userId,
        topic: undefined,
      });
      if (data.status === 'PREPARING') {
        await this.notification.sendNotification({
          title: 'هناك طلب جديد يتم حضيره',
          content: 'هناك طلب جديد يتم حضيره',
          userId: undefined,
          topic: 'DELIVERY',
        });
      }
    }
    this.chatGateway.emitOrderUpdated(`vendor_${order.vendorId}`, order);
    this.chatGateway.emitOrderUpdated(`user_${order.userId}`, order);
    this.chatGateway.emitOrderUpdated(`admins`, order);
    this.chatGateway.emitOrderUpdated(`delivery`, order);
    return updatedOrder;
  }

  async getAllOrdersStatics(filters: { vendorId: number | undefined }) {
    const statistics = await this.prisma.order.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
      _sum: {
        total: true,
      },
      where: {
        vendorId: filters.vendorId ? +filters.vendorId : undefined,
      },
    });

    const status: OrderStatus[] = [
      'REGISTERED',
      'CANCELED',
      'COMPLETE',
      'DELETED',
      'FINISHED',
      'PREPARING',
      'RECEIVED',
      'TACKED',
      'WITH_DELIVERY',
    ];
    return {
      statistics: status.map((s) => {
        return {
          status: s,
          count: statistics.find((stat) => stat.status === s)?._count.id ?? 0,
          total: statistics.find((stat) => stat.status === s)?._sum.total ?? 0,
        };
      }),
    };
  }

  async deleteOrder(orderId: number) {
    await this.prisma.order.update({
      where: {
        id: +orderId,
      },
      data: {
        deleted: true,
      },
    });
    return { message: 'success' };
  }
}
