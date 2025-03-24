import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RecommendationService } from '../service/recommendation.service';
import { Request } from 'express';
import { JwtGuard } from '@auth/jwt.guard';

@Controller('recommendation')
export class RecommendationController {
  constructor(private recommService: RecommendationService) {}

  @Get()
  @UseGuards(JwtGuard)
  async getUsersLike(@Query('page') page: number, @Req() req: Request) {
    return {
      err: null,
      data: await this.recommService.getUsersLike(page, req.user.toString()),
    };
  }

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

  @HttpCode(204)
  @Delete(':id')
  @UseGuards(JwtGuard)
  async deleteUsersLike(@Param('id') id: string, @Req() req: Request) {
    return await this.recommService.deleteUsersLike(req.user.toString(), id);
  }
}
