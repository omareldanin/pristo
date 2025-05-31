import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Transaction, TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from '../users/users.service';

export interface transactionResponse {
  id: number;
  walletBefore: Decimal;
  walletAfter: Decimal;
  amount: Decimal;
  createdBy: string;
  createdAt: Date;
  type: TransactionType;
  User: {
    id: number;
    name: string;
    phone: string;
  };
}

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private userService: UsersService,
  ) {}

  async createTransaction(
    createdBy: string,
    data: {
      amount: number;
      userId: number;
      type: TransactionType;
    },
  ): Promise<Transaction> {
    const user = await this.userService.findOne({
      id: +data.userId,
      phone: undefined,
      role: 'CUSTOMER',
    });

    if (!user) {
      throw new UnauthorizedException('هذا المستخدم غير موجود');
    }

    await this.prisma.user.update({
      where: {
        id: +user.id,
      },
      data: {
        wallet:
          data.type === 'DEPOSIT'
            ? +user.wallet + +data.amount
            : +user.wallet - +data.amount,
      },
    });
    return await this.prisma.transaction.create({
      data: {
        walletBefore: user.wallet,
        walletAfter:
          data.type === 'DEPOSIT'
            ? +user.wallet + +data.amount
            : +user.wallet - +data.amount,
        amount: data.amount,
        type: data.type,
        User: {
          connect: {
            id: +data.userId,
          },
        },
        createdBy: createdBy,
      },
    });
  }

  async getAllTransaction(params: {
    userId: number | undefined;
    type: TransactionType | undefined;
    page: number;
    size: number;
  }): Promise<{
    count: number;
    page: number;
    totalPages: number;
    results: transactionResponse[];
  }> {
    const page = +params.page || 1;
    const pageSize = +params.size || 10;

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: {
          userId: params.userId,
          type: params.type,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * +pageSize,
        take: +pageSize,
        select: {
          id: true,
          walletBefore: true,
          walletAfter: true,
          amount: true,
          createdAt: true,
          type: true,
          createdBy: true,
          User: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      }),

      this.prisma.transaction.count({
        where: {
          userId: params.userId,
          type: params.type,
        },
      }),
    ]);

    return {
      count: total,
      page,
      totalPages: Math.ceil(total / pageSize),
      results: data,
    };
  }
}
