import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/middlewares/jwt-auth.guard';
import { LoggedInUserType } from '../auth/auth.dto';
import { OrderStatus } from '@prisma/client';

@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @UseInterceptors(NoFilesInterceptor())
  @UseGuards(JwtAuthGuard)
  @Post('/create')
  createOrder(@Body() data: any, @Req() req) {
    const loggedInUser = req.user as LoggedInUserType;
    const result = this.orderService.createOrder(loggedInUser.id, data);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getAll')
  getAllOrder(
    @Query()
    filters: {
      status: OrderStatus | undefined;
      vendorId: number | undefined;
      deliverId: number | undefined;
      page: number | undefined;
      size: number | undefined;
      userId: number | undefined;
    },
    // @Req() req,
  ) {
    // const loggedInUser = req.user as LoggedInUserType;
    const result = this.orderService.getAllOrders(filters);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getUserOrders')
  getUserOrders(
    @Query()
    filters: {
      page: number | undefined;
      size: number | undefined;
    },
    @Req() req,
  ) {
    const loggedInUser = req.user as LoggedInUserType;
    const result = this.orderService.getAllOrders({
      ...filters,
      userId: +loggedInUser.id,
      deliverId: undefined,
      status: undefined,
      vendorId: undefined,
    });
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getOrderStatistics')
  getUserStatistics(@Req() req) {
    const loggedInUser = req.user as LoggedInUserType;
    const result = this.orderService.getAllOrdersStatics({
      vendorId: loggedInUser.role == 'VENDOR' ? loggedInUser.id : undefined,
    });
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getVendorOrders')
  getVendorOrders(
    @Query()
    filters: {
      page: number | undefined;
      size: number | undefined;
      status: OrderStatus | undefined;
    },
    @Req() req,
  ) {
    const loggedInUser = req.user as LoggedInUserType;
    const result = this.orderService.getAllOrders({
      ...filters,
      vendorId: +loggedInUser.id,
      deliverId: undefined,
      userId: undefined,
    });
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/edit/:id')
  updateOrder(
    @Param('id') id: number,
    @Body()
    data: {
      status: OrderStatus | undefined;
      time: number | undefined;
      deliveryAgentId: number | undefined;
    },
  ) {
    const result = this.orderService.updateOrder(+id, data);

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  getOne(@Param('id') id: number) {
    const result = this.orderService.getOneOrder(+id);

    return { result };
  }
}
