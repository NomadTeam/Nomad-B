import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from '../service/recommendation.service';
import { RecommendationRepository } from '../recommendation.repository';
import { DataModule } from '@data/data.module';
import { DestinationModule } from '@destination/destination.module';

describe('RecommendationController', () => {
  let controller: RecommendationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DataModule, DestinationModule],
      controllers: [RecommendationController],
      providers: [RecommendationService, RecommendationRepository],
    }).compile();

    controller = module.get<RecommendationController>(RecommendationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
