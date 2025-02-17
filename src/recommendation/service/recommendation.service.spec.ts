import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationService } from './recommendation.service';
import { RecommendationRepository } from '../recommendation.repository';
import { DestinationRepository } from '@destination/destination.repository';
import {
  mockDestination,
  mockDestinationByOrder,
  mockErrArr,
  mockErrDestination,
  mockErrStr,
  mockImage,
  mockUser,
} from '@common/datas/mock-data';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { QueryResult } from 'mysql2';
import { DataModule } from '@data/data.module';
import { ConnectRepository } from '@data/data.repository';
import { DestinationService } from '@destination/service/destination.service';

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DataModule],
      providers: [
        RecommendationService,
        {
          provide: DestinationService,
          useValue: {
            getDestinationMainImage: jest
              .fn()
              .mockResolvedValue([
                mockImage[0],
                mockImage[0],
                mockImage[0],
                mockImage[0],
                mockImage[0],
              ]),
            getRecommendation: jest
              .fn()
              .mockResolvedValue(
                mockDestinationByOrder.map(({ recomm }) => recomm),
              ),
          },
        },
        {
          provide: RecommendationRepository,
          useValue: {
            findOneRecommendationByEmailAndDestId: jest.fn(),
            addRecommendation: jest.fn(),
            getUsersLikeDestination: jest.fn().mockResolvedValue(
              mockDestinationByOrder.map(({ id }) => ({
                destination_id: id,
              })),
            ),
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
        service.validateData(mockUser.email, mockErrDestination[0].id),
      ).rejects.toThrow(NotFoundException);
    });

    it('validateData Function -> 유저가 추천하고자 하는 여행지를 이미 추천했을 경우, 400 에러', async () => {
      jest
        .spyOn(recommRepository, 'findOneRecommendationByEmailAndDestId')
        .mockResolvedValue([{ count: 1 }] as QueryResult);
      await expect(
        service.validateData(mockUser.email, mockDestination[0].id),
      ).rejects.toThrow(BadRequestException);
    });

    it('pushRecommendation Function -> 추천도 +1', async () => {
      jest
        .spyOn(recommRepository, 'findOneRecommendationByEmailAndDestId')
        .mockResolvedValue([{ count: 0 }] as QueryResult);
      const result = await service.pushRecommendation(
        mockUser.email,
        mockDestination[1].id,
      );

      expect(result).toStrictEqual({ recomm: 1, message: '추천 완료' });
    });
  });

  describe('유저가 추천 누른 여행지 조회 API', () => {
    describe('getDestinationIdList Function', () => {
      it('유저가 추천한 여행지를 조회한 결과가 배열이 아닌 경우, 빈 배열 반환', async () => {
        jest
          .spyOn(recommRepository, 'getUsersLikeDestination')
          .mockResolvedValue(mockErrStr as QueryResult);
        expect(
          await service.getDestinationIdList(1, mockUser.email),
        ).toStrictEqual([]);
      });

      it('유저가 추천한 여행지를 조회한 결과가 빈 배열이거나 null 또는 undefined를 포함하고 있는 경우, 빈 배열 반환', async () => {
        for (const err of mockErrArr) {
          jest
            .spyOn(recommRepository, 'getUsersLikeDestination')
            .mockResolvedValue(err);
          expect(
            await service.getDestinationIdList(1, mockUser.email),
          ).toStrictEqual([]);
        }
      });

      it('유저가 추천한 여행지 조회 후 여행지 id 리스트 반환', async () => {
        expect(
          await service.getDestinationIdList(1, mockUser.email),
        ).toStrictEqual(mockDestinationByOrder.map(({ id }) => id));
      });
    });
  });

  describe('추천 취소 API', () => {
    describe('validateDeleteData Function', () => {
      it('취소하려는 여행지를 조회한 결과가 배열이 아니거나 빈 배열이거나 null or undefined 포함하거나 존재하지 않는 경우, 404 에러', async () => {
        await expect(
          service.validateDeleteData(mockUser.email, mockErrDestination[0].id),
        ).rejects.toThrow(NotFoundException);
      });

      it('취소하려는 여행지가 유저가 추천한 여행지가 아닌 경우, 403 에러', async () => {
        jest
          .spyOn(recommRepository, 'findOneRecommendationByEmailAndDestId')
          .mockResolvedValue([{ count: 0 }] as QueryResult);
        await expect(
          service.validateDeleteData('test1@test.com', mockDestination[0].id),
        ).rejects.toThrow(ForbiddenException);
      });
    });
  });
});
