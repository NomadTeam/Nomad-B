import { Module } from '@nestjs/common';
import { UsersController } from './controller/users.controller';
import { UsersService } from './service/users.service';
import { UsersRepository } from './users.repository';
import { DataModule } from '@data/data.module';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { GoogleStrategy } from '@auth/strategies/google.strategy';
import { KakaoStrategy } from '@auth/strategies/kakao.strategy';
import { NaverStrategy } from '@auth/strategies/naver.strategy';

@Module({
  imports: [DataModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    JwtStrategy,
    GoogleStrategy,
    KakaoStrategy,
    NaverStrategy,
  ],
  exports: [UsersRepository],
})
export class UsersModule {}
