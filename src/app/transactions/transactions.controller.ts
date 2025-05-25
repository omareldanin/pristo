import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/middlewares/jwt-auth.guard';

import { TransactionsService } from './transactions.service';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import { TransactionType } from '@prisma/client';
import { LoggedInUserType } from '../auth/auth.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionService: TransactionsService) {}

  @UseInterceptors(NoFilesInterceptor())
  @UseGuards(JwtAuthGuard)
  @Post('/create')
  createTransaction(
    @Body() data: { userId: number; type: TransactionType; amount: number },
    @Req() req,
  ) {
    const loggedInUser = req.user as LoggedInUserType;

    return this.transactionService.createTransaction(loggedInUser.name, {
      amount: data.amount,
      type: data.type,
      userId: data.userId,
    });
  }

  @UseInterceptors(NoFilesInterceptor())
  @UseGuards(JwtAuthGuard)
  @Get('/getAll')
  getTransactions(
    @Query('page') page: number,
    @Query('size') size: number,
    @Query('userId') userId: number,
    @Query('type') type: TransactionType,
    @Req() req,
  ) {
    const loggedInUser = req.user as LoggedInUserType;

    return this.transactionService.getAllTransaction({
      userId: loggedInUser.role === 'CUSTOMER' ? loggedInUser.id : userId,
      type: type,
      page: page,
      size: size,
    });
  }
}
