import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UsersRepository } from '@users/users.repository';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userDB: UsersRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const token = request?.cookies?._uu;
          if (token === undefined || token === null)
            throw new UnauthorizedException('인증되지 않은 사용자입니다.');
          return token;
        },
      ]),
      secretOrKey: process.env.JWT_SECRET_KEY,
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    const foundUser = await this.userDB.isDuplicateEmail(payload.email);
    if (foundUser[0] === undefined) {
      throw new UnauthorizedException('인증되지 않은 사용자입니다.');
    }
    return payload.email;
  }
}
