import { Module } from '@nestjs/common';
import { RecommendationController } from '@recommendation/recommendation.controller';
import { RecommendationService } from '@recommendation/recommendation.service';
import { RecommendationRepository } from '@recommendation/recommendation.repository';
import { DataModule } from '@data/data.module';
import { DestinationModule } from '@destination/destination.module';

@Module({
  imports: [DataModule, DestinationModule],
  controllers: [RecommendationController],
  providers: [RecommendationService, RecommendationRepository],
})
export class RecommendationModule {}
