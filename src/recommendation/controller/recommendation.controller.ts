import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { RecommendationService } from '../service/recommendation.service';
import { Request } from 'express';
import { JwtGuard } from '@auth/jwt.guard';

@Controller('recommendation')
export class RecommendationController {
  constructor(private recommService: RecommendationService) {}

  @Get(':id')
  @UseGuards(JwtGuard)
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
