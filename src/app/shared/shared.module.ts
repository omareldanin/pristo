import { Module } from '@nestjs/common';
import { SharedService } from './shared.service';
import { SharedController } from './shared.controller';
import { HomeCategoryModule } from '../home-category/home-category.module';
import { MainCategoryModule } from '../main-category/main-category.module';
import { BannerModule } from '../banner/banner.module';
import { ChatGateway } from 'src/order.gateway';

@Module({
  imports: [HomeCategoryModule, MainCategoryModule, BannerModule],
  providers: [SharedService, ChatGateway],
  controllers: [SharedController],
})
export class SharedModule {}
