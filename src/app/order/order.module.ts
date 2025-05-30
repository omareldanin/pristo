import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CartModule } from '../cart/cart.module';
import { NotificationModule } from '../notification/notification.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { ChatGateway } from 'src/order.gateway';

@Module({
  imports: [CartModule, NotificationModule, TransactionsModule],
  providers: [OrderService, ChatGateway],
  controllers: [OrderController],
})
export class OrderModule {}
