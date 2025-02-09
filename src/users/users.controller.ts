import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { signUpUserDTO } from './dtos/sign-up-user.dto';
import { UsersService } from './users.service';
import { loginUserDTO } from './dtos/login-user.dto';
import { Response } from 'express';
import { JwtGuard } from './jwt/jwt.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  @Post('sign-up')
  @UseInterceptors(FileInterceptor('profile'))
  async signUpUser(
    @UploadedFile() profile: Express.Multer.File,
    @Body() signUpUserData: signUpUserDTO,
  ) {
    return {
      err: null,
      data: await this.userService.signUpUser(profile, signUpUserData),
    };
  }

  @HttpCode(200)
  @Post('log-in')
  async logInUser(
    @Res({ passthrough: true }) res: Response,
    @Body() loginUserData: loginUserDTO,
  ) {
    const { profile, token } = await this.userService.logInUser(loginUserData);
    res.cookie('_uu', token, { httpOnly: true });
    return { err: null, data: { profile, message: '로그인 되었습니다 :)' } };
  }

  @Get('log-out')
  @UseGuards(JwtGuard)
  async logOutUser(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('_uu');
    return { err: null, data: '로그아웃 되었습니다 :)' };
  }
}
