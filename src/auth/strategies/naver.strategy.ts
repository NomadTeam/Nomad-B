import { authDto } from '@users/dtos/auth.dto';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-naver';
import * as bcrypt from 'bcrypt';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor() {
    super({
      clientID: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
      callbackURL: process.env.NAVER_REDIRECT_URL,
      scope: ['profile', 'email'],
    });
  }

  validate(accessToken: string, refreshToken: string, profile: any) {
    try {
      const { id, displayName, emails, _json } = profile;
      const user: authDto = {
        email: emails[0].value,
        name: displayName,
        password: bcrypt.hashSync(id, 10),
        image: _json.profile_image,
      };

      return user;
    } catch (e) {
      throw e;
    }
  }
}
