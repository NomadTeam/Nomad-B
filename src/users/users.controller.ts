import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { signUpUserDTO } from './dtos/sign-up-user.dto';
import { UsersService } from './users.service';

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
}
