import { Module } from '@nestjs/common';
import { AppController } from '@src/app.controller';
import { AppService } from '@src/app.service';
import { ConfigModule } from '@nestjs/config';
import { DataModule } from '@data/data.module';
import { UsersModule } from '@users/users.module';
import { CategoriesModule } from '@categories/categories.module';
import { DestinationModule } from '@destination/destination.module';
import { RecommendationModule } from '@recommendation/recommendation.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 전역 모듈로 선언
    }),
    DataModule,
    UsersModule,
    CategoriesModule,
    DestinationModule,
    RecommendationModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
