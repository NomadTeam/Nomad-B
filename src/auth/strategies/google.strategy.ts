import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import * as bcrypt from 'bcrypt';
import { authDto } from '@users/dtos/auth.dto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  validate(accessToken: string, refreshToken: string, profile: any) {
    try {
      const { id, displayName, emails, photos } = profile;
      const users: authDto = {
        email: emails[0].value,
        name: displayName,
        password: bcrypt.hashSync(id, 10),
        image: photos[0].value,
      };

      return users;
    } catch (e) {
      throw e;
    }
  }
}
