import { Controller, Get, Param, Query } from '@nestjs/common';
import { DestinationService } from '@destination/service/destination.service';

@Controller('destination')
export class DestinationController {
  constructor(private readonly destinationService: DestinationService) {}

  @Get()
  async getAllDestination(@Query() page: { page: number }) {
    return {
      err: null,
      data: await this.destinationService.getAllDestination(page.page),
    };
  }

  @Get(':id')
  async getDetailDestination(@Param('id') id: string) {
    return await this.destinationService.getDetailDestination(id);
  }
}
