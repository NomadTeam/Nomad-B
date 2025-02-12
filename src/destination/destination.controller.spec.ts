import { Test, TestingModule } from '@nestjs/testing';
import { DestinationController } from './destination.controller';
import { DestinationService } from './destination.service';
import { DestinationRepository } from './destination.repository';
import { DataModule } from '@data/data.module';

describe('DestinationController', () => {
  let controller: DestinationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DataModule],
      controllers: [DestinationController],
      providers: [DestinationService, DestinationRepository],
    }).compile();

    controller = module.get<DestinationController>(DestinationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
