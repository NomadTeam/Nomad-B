import { Test, TestingModule } from '@nestjs/testing';
import { DestinationService } from './destination.service';
import { DestinationRepository } from './destination.repository';

describe('DestinationService', () => {
  let service: DestinationService;
  let destinationRepository: DestinationRepository;

  const mockDestination = [
    {
      id: '12345',
      name: '여행지1',
      address: '주소1',
      information: '설명',
      latitude: 37.123456,
      longitude: 127.123456,
      category: '카테고리1',
    },
    {
      id: '12346',
      name: '여행지2',
      address: '주소2',
      information: '설명',
      latitude: 37.123457,
      longitude: 127.123457,
      category: '카테고리1',
    },
    {
      id: '12347',
      name: '여행지3',
      address: '주소3',
      information: '설명',
      latitude: 37.123458,
      longitude: 127.123458,
      category: '카테고리2',
    },
    {
      id: '12348',
      name: '여행지4',
      address: '주소4',
      information: '설명',
      latitude: 37.123459,
      longitude: 127.123459,
      category: '카테고리2',
    },
    {
      id: '12349',
      name: '여행지5',
      address: '주소5',
      information: '설명',
      latitude: 37.123452,
      longitude: 127.123452,
      category: '카테고리3',
    },
  ];

  const mockImage = [{ image: 'image' }];
  const mockRecomm = [{ count: 1 }];
  const mockErrDestination = [
    { id: '23456', name: '식당1' },
    { id: '34567', name: '카페1' },
  ];

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
        .mockResolvedValue(undefined);
      expect(await service.getDestinationNameList(1, 10)).toStrictEqual([]);
    });

    it('getAllDestination의 반환값이 빈 배열인 경우, 빈 배열 반환', async () => {
      jest
        .spyOn(destinationRepository, 'getAllDestination')
        .mockResolvedValue([]);
      expect(await service.getDestinationNameList(1, 10)).toStrictEqual([]);
    });

    it('getAllDestination의 반환값이 배열이면서 빈 값이 아닌 경우, 여행지별 아이디 & 이름 반환', async () => {
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

    it('getDestinationImageById의 반환값이 배열이면서 빈 값이 아닌 경우, 여행지별 이미지 반환', async () => {
      expect(
        await service.getDestinationMainImage(
          mockDestination.map(({ id }) => ({ id })),
        ),
      ).toStrictEqual([
        { image: 'image' },
        { image: 'image' },
        { image: 'image' },
        { image: 'image' },
        { image: 'image' },
      ]);
    });
  });

  describe('getRecommendation Function', () => {
    it('getRecommByDestId의 반환값이 빈 배열인 경우, 0으로 채움', async () => {
      jest
        .spyOn(destinationRepository, 'getRecommByDestId')
        .mockResolvedValue([]);

      expect(await service.getRecommendation(mockErrDestination)).toStrictEqual(
        [0, 0],
      );
    });

    it('getRecommByDestId의 반환값이 배열이 아닌 경우, 0으로 채움', async () => {
      jest
        .spyOn(destinationRepository, 'getRecommByDestId')
        .mockResolvedValue(null);

      expect(await service.getRecommendation(mockErrDestination)).toStrictEqual(
        [0, 0],
      );
    });

    it('getRecommByDestId의 반환값이 배열이면서 빈 값이 아닌 경우, 여행지별 추천도 반환', async () => {
      expect(
        await service.getRecommendation(
          mockDestination.map(({ id, name }) => ({ id, name })),
        ),
      ).toStrictEqual([1, 1, 1, 1, 1]);
    });
  });
});
