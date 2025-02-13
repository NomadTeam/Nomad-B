import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { signUpUserDTO } from '../dtos/sign-up-user.dto';
import { UsersRepository } from '../users.repository';
import * as bcrypt from 'bcrypt';
import * as AWS from 'aws-sdk';
import * as path from 'path';
import { loginUserDTO } from '../dtos/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { authDto } from '@users/dtos/auth.dto';

@Injectable()
export class UsersService {
  private readonly awsS3: AWS.S3;
  public readonly S3_BUCKET: string;

  constructor(
    private userDB: UsersRepository,
    private readonly jwtService: JwtService,
  ) {
    this.awsS3 = new AWS.S3({
      accessKeyId: process.env.AWS_S3_ACCESS_KEY,
      secretAccessKey: process.env.AWS_S3_SECRET_KEY,
      region: process.env.AWS_S3_REGION,
    });
    this.S3_BUCKET = process.env.AWS_S3_BUCKET_NAME;
  }

  async signUpUser(
    profile: Express.Multer.File,
    signUpUserData: signUpUserDTO,
  ) {
    try {
      const { email, name, password, confirmPassword } = signUpUserData;

      // 이메일이 중복되는 경우
      const isDuplicateEmail = await this.userDB.isDuplicateEmail(email);
      if (isDuplicateEmail[0].count !== 0)
        throw new BadRequestException('이미 존재하는 이메일입니다.');

      // 비밀번호가 일치하지 않는 경우
      if (password !== confirmPassword)
        throw new BadRequestException('비밀번호가 일치하지 않습니다.');

      const hashPassword = await bcrypt.hash(password, 10);
      const profileUrl = await this.uploadProfile(email, profile);

      await this.userDB.registerUser(profileUrl, email, name, hashPassword);

      return { profile: profileUrl, message: '회원가입 완료되었습니다 :)' };
    } catch (e) {
      throw e;
    }
  }

  async uploadProfile(email: string, profile: Express.Multer.File) {
    if (profile === null) return null;
    const key =
      `${email}/profile/${Date.now()}_${path.basename(profile.originalname)}`.replace(
        / /g,
        '',
      );

    if (process.env.MODE !== 'test') {
      await this.awsS3
        .putObject({
          Bucket: this.S3_BUCKET,
          Key: key,
          Body: profile.buffer,
          ACL: 'public-read',
          ContentType: 'jpg',
        })
        .promise();
    }

    return key;
  }

  async logInUser(logInUserData: loginUserDTO) {
    try {
      const { email, password } = logInUserData;

      const isExitedUser = await this.userDB.isDuplicateEmail(email);
      if (isExitedUser[0].count !== 1)
        throw new UnauthorizedException(
          '이메일이나 비밀번호가 일치하지 않습니다.',
        );

      const foundUser = await this.userDB.findUserByEmail(email);
      const isCorrect = await bcrypt.compare(password, foundUser[0].password);
      if (isCorrect === false) {
        throw new UnauthorizedException(
          '이메일이나 비밀번호가 일치하지 않습니다.',
        );
      }
      const token = this.jwtService.sign(
        { email },
        { secret: process.env.JWT_SECRET_KEY, expiresIn: '1h' },
      );
      return {
        profile: foundUser[0].image,
        token,
      };
    } catch (e) {
      throw e;
    }
  }

  async authLogIn(user: authDto) {
    try {
      const foundUser = await this.userDB.isDuplicateEmail(user.email);
      if (foundUser[0].count === 0) {
        await this.userDB.registerUser(
          user.image,
          user.email,
          user.name,
          user.password,
        );
      }

      const token = this.jwtService.sign(
        { email: user.email },
        { expiresIn: '1h', secret: process.env.JWT_SECRET_KEY },
      );

      return { profile: user.image, token };
    } catch (e) {
      throw e;
    }
  }
}
