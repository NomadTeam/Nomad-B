import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoryRepository } from './categories.repository';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  const categories = [
    { name: '관광명소' },
    { name: '국가유산' },
    { name: '동물원' },
    { name: '테마파크' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoryRepository,
          useValue: {
            getAllCategory: jest.fn().mockResolvedValue(categories),
          },
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('카테고리 조회', async () => {
    expect(await controller.getAllCategory()).toStrictEqual({
      err: null,
      data: { categories },
    });
  });
});
