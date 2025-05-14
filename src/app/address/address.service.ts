import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddressCreateType, AddressUpdateType } from './address.dto';
import { UserAddresses } from '@prisma/client';

@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) {}

  async createAddress(
    userId: number,
    data: AddressCreateType,
  ): Promise<UserAddresses> {
    return await this.prisma.userAddresses.create({
      data: {
        name: data.name,
        longitudes: data.longitudes,
        latitude: data.latitude,
        User: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  async editAddress(
    id: number,
    data: AddressUpdateType,
  ): Promise<UserAddresses> {
    return await this.prisma.userAddresses.update({
      where: {
        id: id,
      },
      data: {
        name: data.name,
        longitudes: data.longitudes,
        latitude: data.latitude,
      },
    });
  }

  async getUserAddress(userId: number): Promise<{ results: UserAddresses[] }> {
    const results = await this.prisma.userAddresses.findMany({
      where: {
        userId,
      },
    });
    return { results: results };
  }

  async deleteUserAddress(id: number): Promise<{ message: string }> {
    await this.prisma.userAddresses.delete({
      where: {
        id,
      },
    });

    return { message: 'تم الحذف بنجاح' };
  }
}
