import { Test, TestingModule } from '@nestjs/testing';
import { DestinationService } from '@destination/service/destination.service';
import { DestinationRepository } from '@destination/destination.repository';
import { NotFoundException } from '@nestjs/common';
import {
  mockDestination,
  mockImage,
  mockRecomm,
  mockErrDestination,
  mockDestinationByOrder,
} from '@common/datas/mock-data';

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
            getDestinationOrderByRecomm: jest
              .fn()
              .mockResolvedValue(
                mockDestinationByOrder.sort(
                  (a, b) => b.recomm - a.recomm || a.name.localeCompare(b.name),
                ),
              ),
            getDestinationOrderByName: jest
              .fn()
              .mockResolvedValue(
                mockDestinationByOrder.sort((a, b) =>
                  a.name.localeCompare(b.name),
                ),
              ),
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

  describe('전체 여행지 조회 API', () => {
    it('전체 여행지 리스트 조회(정렬 x)', async () => {
      expect(await service.getAllDestination(1)).toStrictEqual(
        mockDestination.map(({ id, name }) => ({
          image: 'image',
          id,
          name,
          recomm: 1,
        })),
      );
    });

    it('전체 여행지 리스트 조회(추천순)', async () => {
      const result = await service.getAllDestinationOrderByRecomm(1);
      expect(await service.getAllDestinationOrderByRecomm(1)).toStrictEqual(
        result.map((destination) => ({
          ...mockImage[0],
          ...destination,
        })),
      );
    });

    it('전체 여행지 리스트 조회(이름순)', async () => {
      const result = await service.getAllDestinationOrderByName(1);
      expect(await service.getAllDestinationOrderByName(1)).toStrictEqual(
        result.map((destination) => ({
          ...mockImage[0],
          ...destination,
        })),
      );
    });

    describe('getDestinationNameList Function', () => {
      it('getAllDestination의 반환값이 빈 배열인 경우, 빈 배열 반환', async () => {
        jest
          .spyOn(destinationRepository, 'getAllDestination')
          .mockResolvedValue([]);
        expect(await service.getDestinationNameList(1)).toStrictEqual([]);
      });

      it('여행지별 아이디 & 이름 반환', async () => {
        expect(await service.getDestinationNameList(1)).toStrictEqual(
          mockDestination.map(({ id, name }) => ({ id, name })),
        );
      });
    });

    describe('getDestinationMainImage Function', () => {
      it('getDestinationImageById의 반환값이 빈 배열인 경우, null 값으로 채움', async () => {
        jest
          .spyOn(destinationRepository, 'getDestinationImageById')
          .mockResolvedValue([]);
        expect(
          await service.getDestinationMainImage(mockErrDestination),
        ).toStrictEqual([{ image: null }, { image: null }]);
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
      it('여행지별 추천도 반환', async () => {
        expect(
          await service.getRecommendation(
            mockDestination.map(({ id, name }) => ({ id, name })),
          ),
        ).toStrictEqual([1, 1, 1, 1, 1]);
      });
    });

    describe('validateDestination Function', () => {
      it('findOneDestinationById의 결과가 빈 배열인 경우, 404 에러', async () => {
        jest
          .spyOn(destinationRepository, 'findOneDestinationById')
          .mockResolvedValue([]);
        await expect(
          service.validateDestination(mockErrDestination[0].id),
        ).rejects.toThrow(NotFoundException);
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
      it('여행지 id로 이미지 조회했을 때, 반환되는 결과가 빈 배열인 경우, [null] 반환', async () => {
        jest
          .spyOn(destinationRepository, 'getDestinationImageById')
          .mockResolvedValue([]);

        expect(
          await service.getDestinationImageList(mockErrDestination[0].id),
        ).toStrictEqual([null]);
      });

      it('여행지 id로 이미지 조회 후, 해당 여행지의 이미지 리스트 반환', async () => {
        expect(
          await service.getDestinationImageList(mockDestination[0].id),
        ).toStrictEqual(['image']);
      });
    });
  });
});
