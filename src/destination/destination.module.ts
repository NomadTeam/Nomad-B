import { Module } from '@nestjs/common';
import { DestinationController } from './destination.controller';
import { DestinationService } from './destination.service';
import { DestinationRepository } from './destination.repository';
import { DataModule } from '@data/data.module';

@Module({
  imports: [DataModule],
  controllers: [DestinationController],
  providers: [DestinationService, DestinationRepository],
})
export class DestinationModule {}
