import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SharedService } from './shared.service';
import { JwtAuthGuard } from 'src/middlewares/jwt-auth.guard';

@Controller('shared')
export class SharedController {
  constructor(private sharedService: SharedService) {}

  @Get('/home')
  getHomePage(@Query() filters: any) {
    const result = this.sharedService.getHomePage(filters);

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/createOption')
  createOption(
    @Body() data: { name: string; content: string; active: boolean },
    // @Req() req,
  ) {
    // const loggedInUser = req.user as LoggedInUserType;

    return this.sharedService.createOption(data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/updateOption')
  updateOption(
    @Body() data: { name: string; content: string; active: boolean },
    // @Req() req,
  ) {
    // const loggedInUser = req.user as LoggedInUserType;

    return this.sharedService.editOption(data);
  }

  @Get('/getOptions')
  getOption() // @Req() req,
  {
    // const loggedInUser = req.user as LoggedInUserType;

    return this.sharedService.returnOptions();
  }
}
