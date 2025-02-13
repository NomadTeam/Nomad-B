import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import * as bcrypt from 'bcrypt';
import { authDto } from '@users/dtos/auth.dto';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor() {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      callbackURL: process.env.KAKAO_CALLBACK_URL,
    });
  }

  validate(accessToken: string, refreshToken: string, profile: any) {
    try {
      const { id, _json } = profile;

      const user: authDto = {
        email: _json.kakao_account.email,
        name: _json.properties.nickname,
        password: bcrypt.hashSync(id.toString(), 10),
        image: _json.properties.profile_image,
      };

      return user;
    } catch (e) {
      throw e;
    }
  }
}
