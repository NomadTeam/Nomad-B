import { Controller, Get } from '@nestjs/common';
import { CategoryRepository } from './categories.repository';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoryDB: CategoryRepository) {}
  @Get()
  async getAllCategory() {
    return {
      err: null,
      data: { categories: await this.categoryDB.getAllCategory() },
    };
  }
}
