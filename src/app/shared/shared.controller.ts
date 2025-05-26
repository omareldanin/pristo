import { Controller, Get, Query } from '@nestjs/common';
import { SharedService } from './shared.service';

@Controller('shared')
export class SharedController {
  constructor(private sharedService: SharedService) {}

  @Get('/home')
  getHomePage(@Query() filters: any) {
    const result = this.sharedService.getHomePage(filters);

    return result;
  }
}
