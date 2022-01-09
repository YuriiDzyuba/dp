import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as querystring from 'querystring';
import axios from 'axios';
import { createUniqueString } from '../utils/createUniqueString';
import { GoogleUserType } from './type/GoogleUser.type';
import { NormalizedGoogleUserType } from './type/normalizedGoogleUser.type';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';
import { UserType } from 'src/user/types/user.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}

  getLinkToGoogleAccount() {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: `${process.env.HOME_DOMAIN}/api/auth/google_redirect`,
      client_id: process.env.GOOGLE_CLIENT_ID,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
    };

    return `${rootUrl}?${querystring.stringify(options)}`;
  }

  async checkGoogleUser(code: string): Promise<UserType> {
    const googleUser = await this.getGoogleUser(code);

    const foundedUser = await this.userService.findOneUserByEmail(
      googleUser.email,
    );

    if (foundedUser) {
      return foundedUser;
    }

    if (!foundedUser) {
      const newApplicant = this.normalizeGoogleUser(googleUser);

      const newUser = await this.userService.registerNewUser(newApplicant);

      this.emailService.sendMailToNewUser(newUser, newApplicant.password);
      return newUser;
    }
  }

  async getGoogleUser(code: string): Promise<GoogleUserType> {
    const { id_token, access_token } = await this._getGoogleTokens({
      code,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: `${process.env.HOME_DOMAIN}/api/auth/google_redirect`,
    });

    const googleUser = await this._getUserByTokens(id_token, access_token);

    if (!googleUser.verified_email) {
      throw new HttpException(
        { message: "user without verified email can't be logged in" },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    return googleUser;
  }

  normalizeGoogleUser(googleUser: GoogleUserType): NormalizedGoogleUserType {
    return {
      email: googleUser.email,
      username: `${googleUser.name
        .split(' ')
        .join('')
        .trim()}_${createUniqueString()}`,
      password: createUniqueString(),
      avatar: googleUser.picture,
    };
  }

  async _getGoogleTokens({ code, clientId, clientSecret, redirectUri }) {
    const url = 'https://oauth2.googleapis.com/token';
    const values = {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    };

    try {
      const { data } = await axios.post(url, querystring.stringify(values), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return data;
    } catch (err) {
      throw new HttpException(
        { message: err.message },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async _getUserByTokens(id_token, access_token) {
    try {
      const { data } = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
        {
          headers: {
            Authorization: `Bearer ${id_token}`,
          },
        },
      );
      return data;
    } catch (err) {
      throw new HttpException(
        { message: err.message },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
