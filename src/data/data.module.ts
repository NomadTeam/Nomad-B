import { Module } from '@nestjs/common';
import { ConnectRepository } from '@data/data.repository';

@Module({
  providers: [ConnectRepository],
})
export class DataModule {}
