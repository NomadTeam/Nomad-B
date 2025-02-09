import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { DataModule } from '@data/data.module';
import { JwtStrategy } from './jwt/jwt.strategy';

@Module({
  imports: [DataModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, JwtStrategy],
})
export class UsersModule {}
