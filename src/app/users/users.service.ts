import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { env } from 'src/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(params: {
    phone: string | undefined;
    id: number | undefined;
  }): Promise<User | undefined> {
    return await this.prisma.user.findFirst({
      where: params.id
        ? {
            id: params.id,
          }
        : {
            phone: params.phone,
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

  async updateToken(
    id: number,
    token: string,
    fcm: string | undefined,
  ): Promise<{ token: string }> {
    return await this.prisma.user.update({
      where: {
        id: id,
      },
      data: {
        token,
        fcm,
      },
      select: {
        token: true,
      },
    });
  }

  async updateProfile(data: {
    id: number;
    name: string | undefined;
    phone: string | undefined;
    avatar: string | undefined;
    fcm: string | undefined;
  }): Promise<User> {
    const user = await this.prisma.user.update({
      where: {
        id: data.id,
      },
      data,
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
}
