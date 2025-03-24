import { Controller, Get, Param, Query } from '@nestjs/common';
import { DestinationService } from '@destination/service/destination.service';
import { NAME, RECOMMENDATION } from '@common/datas/constant-data';

@Controller('destination')
export class DestinationController {
  constructor(private readonly destinationService: DestinationService) {}

  @Get()
  async getAllDestination(
    @Query('page') page: number,
    @Query('sort') sort: number,
  ) {
    // 추천순 정렬
    if (sort === RECOMMENDATION) {
      return {
        err: null,
        data: await this.destinationService.getAllDestinationOrderByRecomm(
          page,
        ),
      };
    }

    // 가나다순 정렬
    if (sort === NAME) {
      return {
        err: null,
        data: await this.destinationService.getAllDestinationOrderByName(page),
      };
    }

    return {
      err: null,
      data: await this.destinationService.getAllDestination(page),
    };
  }

  @Get(':id')
  async getDetailDestination(@Param('id') id: string) {
    return await this.destinationService.getDetailDestination(id);
  }
}
