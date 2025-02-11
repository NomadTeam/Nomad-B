import { Module } from '@nestjs/common';
import { DestinationController } from '@destination/destination.controller';
import { DestinationService } from '@destination/destination.service';
import { DestinationRepository } from '@destination/destination.repository';
import { DataModule } from '@data/data.module';

@Module({
  imports: [DataModule],
  controllers: [DestinationController],
  providers: [DestinationService, DestinationRepository],
  exports: [DestinationRepository],
})
export class DestinationModule {}
