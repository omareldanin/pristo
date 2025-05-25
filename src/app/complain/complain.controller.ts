import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LoggedInUserType } from '../auth/auth.dto';
import { JwtAuthGuard } from 'src/middlewares/jwt-auth.guard';
import { ComplainService } from './complain.service';
import { NoFilesInterceptor } from '@nestjs/platform-express';

@Controller('complain')
export class ComplainController {
  constructor(private complainService: ComplainService) {}

  @UseInterceptors(NoFilesInterceptor())
  @UseGuards(JwtAuthGuard)
  @Post('/create')
  createComplain(
    @Body() data: { title: string; description: string },
    @Req() req,
  ) {
    const loggedInUser = req.user as LoggedInUserType;
    const result = this.complainService.createComplain({
      ...data,
      userId: +loggedInUser.id,
    });

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getAll')
  getAll(@Query() query: any) {
    const result = this.complainService.getAllComplains(query);

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/delete/:id')
  delete(@Param('id') id: string) {
    const result = this.complainService.deleteComplain(+id);

    return result;
  }
}
