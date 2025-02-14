import { Test, TestingModule } from '@nestjs/testing';
import { DestinationService } from '@destination/service/destination.service';
import { DestinationRepository } from '@destination/destination.repository';
import { NotFoundException } from '@nestjs/common';
import { QueryResult } from 'mysql2';
import {
  mockDestination,
  mockImage,
  mockRecomm,
  mockErrDestination,
  mockErrStr,
  mockErrArr,
} from '@common/mocks/mock-data';

describe('DestinationService', () => {
  let service: DestinationService;
  let destinationRepository: DestinationRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DestinationService,
        {
          provide: DestinationRepository,
          useValue: {
            getAllDestination: jest.fn().mockResolvedValue(mockDestination),
            getDestinationImageById: jest.fn().mockResolvedValue(mockImage),
            getRecommByDestId: jest.fn().mockResolvedValue(mockRecomm),
            findOneDestinationById: jest
              .fn()
              .mockResolvedValue([mockDestination[0]]),
          },
        },
      ],
    }).compile();

    service = module.get<DestinationService>(DestinationService);
    destinationRepository = module.get<DestinationRepository>(
      DestinationRepository,
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDestinationNameList Function', () => {
    it('getAllDestination의 반환값이 배열이 아닌 경우, 빈 배열 반환', async () => {
      jest
        .spyOn(destinationRepository, 'getAllDestination')
        .mockResolvedValue(mockErrStr as QueryResult);
      expect(await service.getDestinationNameList(1, 10)).toStrictEqual([]);
    });

    it('getAllDestination의 반환값이 빈 배열인 경우, 빈 배열 반환', async () => {
      jest
        .spyOn(destinationRepository, 'getAllDestination')
        .mockResolvedValue([]);
      expect(await service.getDestinationNameList(1, 10)).toStrictEqual([]);
    });

    it('여행지별 아이디 & 이름 반환', async () => {
      expect(await service.getDestinationNameList(1, 10)).toStrictEqual(
        mockDestination.map(({ id, name }) => ({ id, name })),
      );
    });
  });

  describe('getDestinationMainImage Function', () => {
    const mockError = [null, []];
    it('getDestinationImageById의 반환값이 빈 배열이거나 배열이 아닌 경우, null 값으로 채움', async () => {
      for (const err of mockError) {
        jest
          .spyOn(destinationRepository, 'getDestinationImageById')
          .mockResolvedValue(err);

        expect(
          await service.getDestinationMainImage(mockErrDestination),
        ).toStrictEqual([{ image: null }, { image: null }]);
      }
    });

    it('여행지별 이미지 반환', async () => {
      expect(
        await service.getDestinationMainImage(
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
        await service.getRecommendation(
          mockErrDestination.map(({ id }) => ({ id })),
        ),
      ).toStrictEqual([0, 0]);
    });

    it('여행지별 추천도 반환', async () => {
      expect(
        await service.getRecommendation(
          mockDestination.map(({ id, name }) => ({ id, name })),
        ),
      ).toStrictEqual([1, 1, 1, 1, 1]);
    });
  });

  describe('validateDestination Function', () => {
    it('findOneDestinationById의 결과가 배열이 아닌 경우, 404 에러', async () => {
      jest
        .spyOn(destinationRepository, 'findOneDestinationById')
        .mockResolvedValue(mockErrStr as QueryResult);
      await expect(
        service.validateDestination(mockErrDestination[0].id),
      ).rejects.toThrow(NotFoundException);
    });

    it('findOneDestinationById의 결과가 빈 배열이거나 null 또는 undefined를 포함하고 있는 경우, 404 에러', async () => {
      for (const err of mockErrArr) {
        jest
          .spyOn(destinationRepository, 'findOneDestinationById')
          .mockResolvedValue(err);
        await expect(
          service.validateDestination(mockErrDestination[0].id),
        ).rejects.toThrow(NotFoundException);
      }
    });

    it('여행지 정보 반환', async () => {
      delete mockDestination[0].id;
      expect(
        await service.validateDestination(mockDestination[0].id),
      ).toStrictEqual({
        ...mockDestination[0],
      });
    });
  });

  describe('getDestinationImageList Function', () => {
    it('여행지 id로 이미지 조회했을 때, 반환되는 결과가 배열이 아닌 경우 [null] 반환', async () => {
      jest
        .spyOn(destinationRepository, 'getDestinationImageById')
        .mockResolvedValue(mockErrStr as QueryResult);
      expect(
        await service.getDestinationImageList(mockErrDestination[0].id),
      ).toStrictEqual([null]);
    });

    it('여행지 id로 이미지 조회했을 때, 반환되는 결과가 빈 배열이거나 null 또는 undefined를 포함하고 있는 경우, [null] 반환', async () => {
      for (const err of mockErrArr) {
        jest
          .spyOn(destinationRepository, 'getDestinationImageById')
          .mockResolvedValue(err);

        expect(
          await service.getDestinationImageList(mockErrDestination[0].id),
        ).toStrictEqual([null]);
      }
    });

    it('여행지 id로 이미지 조회 후, 해당 여행지의 이미지 리스트 반환', async () => {
      expect(
        await service.getDestinationImageList(mockDestination[0].id),
      ).toStrictEqual(['image']);
    });
  });
});
