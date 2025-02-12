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
import { DataModule } from '@data/data.module';
import { ConnectRepository } from '@data/data.repository';
const mockConnection = {
  beginTransaction: jest.fn(),
  commit: jest.fn(),
  rollback: jest.fn(),
  release: jest.fn(),
  execute: jest.fn(),
};

const mockPool = {
  getConnection: jest.fn().mockResolvedValue(mockConnection),
};

describe('RecommendationService', () => {
  let service: RecommendationService;
  let recommRepository: RecommendationRepository;
  let destRepository: DestinationRepository;

  const mockEmail = 'test@test.com';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DataModule],
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
              .mockImplementation((id: string) => {
                if (id === mockDestination[0].id) return [mockDestination[0]];
                if (id === mockDestination[1].id) return [mockDestination[1]];
              }),
            getRecommByDestId: jest.fn().mockResolvedValue([{ count: 1 }]),
          },
        },
        {
          provide: ConnectRepository,
          useValue: {
            getPool: jest.fn().mockReturnValue(mockPool),
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

  afterEach(() => {
    jest.clearAllMocks();
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
      const result = await service.pushRecommendation(
        mockEmail,
        mockDestination[1].id,
      );

      expect(result).toStrictEqual({ recomm: 1, message: '추천 완료' });
    });
  });
});
