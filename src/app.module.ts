import { Module } from '@nestjs/common';
import { AppController } from '@src/app.controller';
import { AppService } from '@src/app.service';
import { ConfigModule } from '@nestjs/config';
import { DataModule } from '@data/data.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 전역 모듈로 선언
    }),
    DataModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
