import { Controller, Get, Param, Req } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { Request } from 'express';

@Controller('recommendation')
export class RecommendationController {
  constructor(private recommService: RecommendationService) {}

  @Get(':id')
  async pushRecommendation(@Param('id') id: string, @Req() req: Request) {
    return {
      err: null,
      data: await this.recommService.pushRecommendation(
        req.user.toString(),
        id,
      ),
    };
  }
}
