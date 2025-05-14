import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './app/auth/auth.module';
import { UsersModule } from './app/users/users.module';
import { AddressModule } from './app/address/address.module';
import { TransactionsModule } from './app/transactions/transactions.module';
import { NotificationModule } from './app/notification/notification.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    AddressModule,
    TransactionsModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
