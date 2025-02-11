import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationService } from './recommendation.service';
import { RecommendationRepository } from './recommendation.repository';
import { DestinationRepository } from '@destination/destination.repository';
import {
  mockDestination,
  mockErrDestination,
} from '@destination/mocks/mock-data';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { QueryResult } from 'mysql2';

describe('RecommendationService', () => {
  let service: RecommendationService;
  let recommRepository: RecommendationRepository;
  let destRepository: DestinationRepository;

  const mockEmail = 'test@test.com';
  const mockNewDestinationId = '78945';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationService,
        {
          provide: RecommendationRepository,
          useValue: {
            findOneRecommendationByEmailAndDestId: jest
              .fn()
              .mockResolvedValue([{ count: 0 }]),
            addRecommendation: jest.fn(),
          },
        },
        {
          provide: DestinationRepository,
          useValue: {
            findOneDestinationById: jest
              .fn()
              .mockResolvedValue([mockDestination[0]]),
          },
        },
      ],
    }).compile();

    service = module.get<RecommendationService>(RecommendationService);
    recommRepository = module.get<RecommendationRepository>(
      RecommendationRepository,
    );
    destRepository = module.get<DestinationRepository>(DestinationRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('추천도 클릭 API', () => {
    it('validateData Function -> 유저가 추천하고자 하는 여행지가 존재하지 않는 경우, 404 에러', async () => {
      jest
        .spyOn(destRepository, 'findOneDestinationById')
        .mockResolvedValue([]);
      await expect(
        service.validateData(mockEmail, mockErrDestination[0].id),
      ).rejects.toThrow(NotFoundException);
    });

    it('validateData Function -> 유저가 추천하고자 하는 여행지를 이미 추천했을 경우, 400 에러', async () => {
      jest
        .spyOn(recommRepository, 'findOneRecommendationByEmailAndDestId')
        .mockResolvedValue([{ count: 1 }] as QueryResult);
      await expect(
        service.validateData(mockEmail, mockDestination[0].id),
      ).rejects.toThrow(BadRequestException);
    });

    it('pushRecommendation Function -> 추천도 +1', async () => {
      expect(
        await service.pushRecommendation(mockEmail, mockNewDestinationId),
      ).toStrictEqual({ message: '추천 완료' });
    });
  });
});
