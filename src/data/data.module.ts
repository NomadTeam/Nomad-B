import { Module } from '@nestjs/common';
import { ConnectRepository } from '@data/data.repository';

@Module({
  providers: [ConnectRepository],
  exports: [ConnectRepository],
})
export class DataModule {}
