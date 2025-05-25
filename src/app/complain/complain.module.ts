import { Module } from '@nestjs/common';
import { ComplainService } from './complain.service';
import { ComplainController } from './complain.controller';

@Module({
  providers: [ComplainService],
  controllers: [ComplainController]
})
export class ComplainModule {}
