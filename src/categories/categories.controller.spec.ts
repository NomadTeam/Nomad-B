import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoryRepository } from './categories.repository';
import { mockCategories } from '@common/datas/mock-data';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoryRepository,
          useValue: {
            getAllCategory: jest.fn().mockResolvedValue(mockCategories),
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
      data: { categories: mockCategories },
    });
  });
});
