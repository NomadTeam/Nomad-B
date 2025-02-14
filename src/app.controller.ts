import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('search')
  async search(@Query('search') search: string, @Query('page') page: number) {
    return { err: null, data: await this.appService.search(search, page) };
  }
}
