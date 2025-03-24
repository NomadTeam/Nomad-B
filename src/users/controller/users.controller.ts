import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  signUpUserDTO,
  userNameDto,
  userPasswordDto,
} from '../dtos/sign-up-user.dto';
import { UsersService } from '../service/users.service';
import { loginUserDTO } from '../dtos/login-user.dto';
import { Request, Response } from 'express';
import { JwtGuard } from '../../auth/jwt.guard';
import { AuthGuard } from '@nestjs/passport';

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

  @Get('auth/google')
  @UseGuards(AuthGuard('google'))
  async googleLogIn() {}

  @Get('auth/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleLogInCallback(
    @Res({ passthrough: true }) res: Response,
    @Req() req,
  ) {
    const { profile, token } = await this.userService.authLogIn(req.user);

    res.cookie('_uu', token, { httpOnly: true });
    return { err: null, data: { profile, message: '로그인 되었습니다 :)' } };
  }

  @Get('auth/kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoLogin() {}

  @Get('auth/kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoLogInCallback(
    @Res({ passthrough: true }) res: Response,
    @Req() req,
  ) {
    const { profile, token } = await this.userService.authLogIn(req.user);

    res.cookie('_uu', token, { httpOnly: true });
    return { err: null, data: { profile, message: '로그인 되었습니다 :)' } };
  }

  @Get('auth/naver')
  @UseGuards(AuthGuard('naver'))
  async naverLogin() {}

  @Get('auth/naver/callback')
  @UseGuards(AuthGuard('naver'))
  async naverLogInCallback(
    @Res({ passthrough: true }) res: Response,
    @Req() req,
  ) {
    const { profile, token } = await this.userService.authLogIn(req.user);

    res.cookie('_uu', token, { httpOnly: true });
    return { err: null, data: { profile, message: '로그인 되었습니다 :)' } };
  }

  @Put('profile/name')
  @UseGuards(JwtGuard)
  async upateUserName(@Req() req: Request, @Body() name: userNameDto) {
    await this.userService.updateUserName(name, req.user.toString());
    return { err: null, data: { message: '이름이 변경되었습니다 :)' } };
  }

  @Put('profile/password')
  @UseGuards(JwtGuard)
  async updateUserPassword(
    @Req() req: Request,
    @Body() updateData: userPasswordDto,
  ) {
    await this.userService.updateUserPassword(updateData, req.user.toString());
    return { err: null, data: { message: '비밀번호가 변경되었습니다 :)' } };
  }
}
