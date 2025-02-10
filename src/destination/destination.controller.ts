import { Controller, Get, Query } from '@nestjs/common';
import { DestinationService } from './destination.service';
import { Public } from '@common/decorators/public.decorator';

@Controller('destination')
export class DestinationController {
  constructor(private readonly destinationService: DestinationService) {}

  @Public()
  @Get()
  async getAllDestination(@Query() page: { page: number }) {
    return {
      err: null,
      data: await this.destinationService.getAllDestination(page.page),
    };
  }
}
