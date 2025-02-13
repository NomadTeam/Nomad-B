import { Module } from '@nestjs/common';
import { DestinationController } from '@destination/controller/destination.controller';
import { DestinationService } from '@destination/service/destination.service';
import { DestinationRepository } from '@destination/destination.repository';
import { DataModule } from '@data/data.module';

@Module({
  imports: [DataModule],
  controllers: [DestinationController],
  providers: [DestinationService, DestinationRepository],
  exports: [DestinationRepository],
})
export class DestinationModule {}
