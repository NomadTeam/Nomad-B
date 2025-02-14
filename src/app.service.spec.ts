import { DestinationService } from '@destination/service/destination.service';
import { AppService } from './app.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ConnectRepository } from '@data/data.repository';
import {
  mockDestination,
  mockErrArr,
  mockErrDestination,
  mockErrStr,
  mockImage,
  mockRecomm,
} from '@common/mocks/mock-data';
import { QueryResult } from 'mysql2';
import { DestinationRepository } from '@destination/destination.repository';
import * as mysql from 'mysql2/promise';

jest.mock('mysql2/promise', () => ({
  createPool: jest.fn(() => ({
    execute: jest.fn(), // SQL 실행을 위한 Mock 함수
    getConnection: jest.fn(),
    query: jest.fn(),
  })),
}));

describe('AppService', () => {
  let service: AppService;
  let destinationService: DestinationService;
  let destinationRepository: DestinationRepository;
  let db: ConnectRepository;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        DestinationService,
        {
          provide: DestinationRepository,
          useValue: {
            getDestinationImageById: jest.fn().mockResolvedValue(mockImage),
            getRecommByDestId: jest.fn().mockResolvedValue(mockRecomm),
          },
        },
        {
          provide: ConnectRepository,
          useValue: {
            getPool: jest.fn().mockReturnValue(mysql.createPool('test')),
            search: jest.fn().mockResolvedValue(mockDestination),
          },
        },
      ],
    }).compile();
    service = module.get<AppService>(AppService);
    db = module.get<ConnectRepository>(ConnectRepository);
    destinationRepository = module.get<DestinationRepository>(
      DestinationRepository,
    );
    destinationService = module.get<DestinationService>(DestinationService);
  });

  describe('검색 API', () => {
    describe('findSearch Function', () => {
      it('검색 결과가 배열이 아닌 경우, 빈 배열 반환', async () => {
        jest.spyOn(db, 'search').mockResolvedValue(mockErrStr as QueryResult);
        expect(await service.findSearch([], 1, 20)).toStrictEqual([]);
      });

      it('검색 결과가 빈 배열이거나 null, undefined를 포함하는 경우, 빈 배열 반환', async () => {
        for (const err of mockErrArr) {
          jest.spyOn(db, 'search').mockResolvedValue(err);
          expect(await service.findSearch(['에러'], 1, 20)).toStrictEqual([]);
        }
      });

      it('검색 결과에 대한 여행지의 정보 리스트 반환', async () => {
        expect(await service.findSearch(['여행지'], 1, 20)).toStrictEqual(
          mockDestination,
        );
      });
    });

    describe('getDestinationMainImage Function', () => {
      it('검색 결과에 대한 여행지의 id로 이미지 조회 결과가 빈 배열이거나 배열이 아닌 경우, null로 채움', async () => {
        const mockError = [null, []];
        for (const err of mockError) {
          jest
            .spyOn(destinationRepository, 'getDestinationImageById')
            .mockResolvedValue(err);

          expect(
            await destinationService.getDestinationMainImage(
              mockErrDestination.map(({ id }) => ({ id })),
            ),
          ).toStrictEqual([{ image: null }, { image: null }]);
        }
      });

      it('여행지별 이미지 리스트 반환', async () => {
        expect(
          await destinationService.getDestinationMainImage(
            mockDestination.map(({ id }) => ({ id })),
          ),
        ).toStrictEqual([
          mockImage[0],
          mockImage[0],
          mockImage[0],
          mockImage[0],
          mockImage[0],
        ]);
      });
    });

    describe('getRecommendation Function', () => {
      it('getRecommByDestId의 반환값이 빈 배열인 경우, 0으로 채움', async () => {
        jest
          .spyOn(destinationRepository, 'getRecommByDestId')
          .mockResolvedValue([]);

        expect(
          await destinationService.getRecommendation(
            mockErrDestination.map(({ id }) => ({ id })),
          ),
        ).toStrictEqual([0, 0]);
      });

      it('여행지별 추천도 반환', async () => {
        expect(
          await destinationService.getRecommendation(
            mockDestination.map(({ id, name }) => ({ id, name })),
          ),
        ).toStrictEqual([1, 1, 1, 1, 1]);
      });
    });

    it('검색한 결과 리스트 반환', async () => {
      expect(await service.search('여행지', 1)).toStrictEqual(
        mockDestination.map((result) => ({
          image: 'image',
          ...result,
          recomm: 1,
        })),
      );
    });
  });
});
