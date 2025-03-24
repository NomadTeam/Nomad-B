import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoryRepository } from './categories.repository';
import { DataModule } from '@data/data.module';

@Module({
  imports: [DataModule],
  controllers: [CategoriesController],
  providers: [CategoryRepository],
})
export class CategoriesModule {}
