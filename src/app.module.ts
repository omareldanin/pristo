import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './app/auth/auth.module';
import { UsersModule } from './app/users/users.module';
import { AddressModule } from './app/address/address.module';
import { TransactionsModule } from './app/transactions/transactions.module';
import { NotificationModule } from './app/notification/notification.module';
import { BannerModule } from './app/banner/banner.module';
import { MainCategoryModule } from './app/main-category/main-category.module';
import { HomeCategoryModule } from './app/home-category/home-category.module';
import { VendorsModule } from './app/vendors/vendors.module';
import { SubCategoryModule } from './app/sub-category/sub-category.module';
import { ComplainModule } from './app/complain/complain.module';
import { SharedModule } from './app/shared/shared.module';
import { ProductCategoryModule } from './app/product-category/product-category.module';
import { FavoritesModule } from './app/favorites/favorites.module';
import { ProductModule } from './app/product/product.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads', // URL prefix
    }),
    AuthModule,
    UsersModule,
    AddressModule,
    TransactionsModule,
    NotificationModule,
    BannerModule,
    MainCategoryModule,
    HomeCategoryModule,
    VendorsModule,
    SubCategoryModule,
    ComplainModule,
    SharedModule,
    ProductCategoryModule,
    FavoritesModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
