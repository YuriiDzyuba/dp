import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_LINK,
} from '../config';
import * as querystring from 'querystring';
import axios from 'axios';
import { createUniqueString } from '../utils/createUniqueString';
import { GoogleUserType } from './type/GoogleUser.type';
import { NormalizedGoogleUserType } from './type/normalizedGoogleUser.type';

@Injectable()
export class AuthService {
  getLinkToGoogleAccount() {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: `http://localhost:5000/api/auth/google_redirect`,
      client_id: GOOGLE_CLIENT_ID,
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

  async getGoogleUser(code: string): Promise<GoogleUserType> {
    const { id_token, access_token } = await this._getGoogleTokens({
      code,
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      redirectUri: GOOGLE_REDIRECT_LINK,
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
