import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { env } from 'src/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(params: {
    phone: string | undefined;
    id: number | undefined;
    role: UserRole;
  }): Promise<User | undefined> {
    return await this.prisma.user.findFirst({
      where: params.id
        ? {
            id: params.id,
            role: params.role,
          }
        : {
            phone: params.phone,
            role: params.role,
          },
    });
  }

  async getProfile(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: +id,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        avatar: true,
        wallet: true,
        delivery: {
          select: {
            online: true,
          },
        },
      },
    });

    return { results: user };
  }

  async getAllUser(filters: { role: UserRole; page: number; size: number }) {
    const page = +filters.page || 1;
    const pageSize = +filters.size || 10000;

    const [results, total] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          role: filters.role,
        },
        select: {
          id: true,
          name: true,
          phone: true,
          avatar: true,
          wallet: true,
          delivery: {
            select: {
              online: true,
            },
          },
        },
        orderBy: {
          id: 'asc',
        },
        skip: (page - 1) * +pageSize,
        take: +pageSize,
      }),
      this.prisma.user.count({
        where: {
          role: filters.role,
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

  async deleteUser(id: number) {
    await this.prisma.user.delete({
      where: {
        id: +id,
      },
    });

    return { message: 'success' };
  }
  async createDelivery(data: {
    name: string | undefined;
    phone: string;
    password: string;
    avatar: string | undefined;
  }) {
    let user = await this.findOne({
      phone: data.phone,
      id: undefined,
      role: undefined,
    });

    if (user) {
      throw new UnauthorizedException('هذا الرقم مسجل مسبفا');
    }

    return await this.prisma.user.create({
      data: {
        name: data.name,
        phone: data.phone,
        password: bcrypt.hashSync(
          data.password + (env.PASSWORD_SALT as string),
          12,
        ),
        role: 'DELIVERY',
        avatar: data.avatar,
        delivery: {
          create: {
            online: false,
          },
        },
        token: '',
      },
    });
  }

  async createUser(data: {
    name: string | undefined;
    phone: string;
    password: string;
    fcm: string | undefined;
  }): Promise<User | undefined> {
    return await this.prisma.user.create({
      data: {
        name: data.name,
        phone: data.phone,
        fcm: data.fcm,
        password: bcrypt.hashSync(
          data.password + (env.PASSWORD_SALT as string),
          12,
        ),
        role: 'CUSTOMER',
        token: '',
      },
    });
  }

  async updateToken(data: {
    id: number;
    refreshToken?: string;
    refreshTokens?: string[];
    fcm: string | undefined;
  }): Promise<{ refresh_token: string[] }> {
    return await this.prisma.user.update({
      where: {
        id: +data.id,
      },
      data: {
        fcm: data.fcm ? data.fcm : undefined,
        // Only one session is allowed
        refresh_token: data.refreshToken
          ? { set: [data.refreshToken] }
          : data.refreshTokens
            ? { set: data.refreshTokens }
            : undefined,
      },
      select: {
        refresh_token: true,
      },
    });
  }

  async getUserByID(userID: number) {
    const returnedUser = await this.prisma.user.findUnique({
      where: {
        id: userID,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        avatar: true,
        wallet: true,
      },
    });
    return returnedUser;
  }

  async getUserRefreshTokens(userID: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userID,
      },
      select: {
        refresh_token: true,
      },
    });
    return user?.refresh_token;
  }

  async updateProfile(data: {
    id: number;
    name: string | undefined;
    phone: string | undefined;
    avatar: string | undefined;
    fcm: string | undefined;
    online: string | undefined;
  }): Promise<User> {
    const user = await this.prisma.user.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        phone: data.phone,
        avatar: data.avatar,
        fcm: data.fcm,
        delivery: {
          update: {
            data: {
              online:
                data.online === 'true'
                  ? true
                  : data.online === 'false'
                    ? false
                    : undefined,
            },
          },
        },
      },
    });

    return user;
  }

  async resetPassword(data: {
    id: number;
    password: string;
  }): Promise<{ token: string }> {
    return await this.prisma.user.update({
      where: {
        id: data.id,
      },
      data: {
        password: bcrypt.hashSync(
          data.password + (env.PASSWORD_SALT as string),
          12,
        ),
      },
      select: {
        token: true,
      },
    });
  }
  async updateDelivery(data: {
    id: number;
    name: string | undefined;
    phone: string | undefined;
    avatar: string | undefined;
  }) {
    const user = await this.prisma.user.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        phone: data.phone,
        avatar: data.avatar ? data.avatar : undefined,
      },
    });

    return user;
  }
}
