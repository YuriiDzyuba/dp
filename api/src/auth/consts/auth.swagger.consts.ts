import { HttpStatus } from '@nestjs/common';
import { UserEntity } from '../../user/entities/user.entity';

export const loginUser = {
  apiOperation: {
    summary: 'login user by email and password',
  },
  apiResponse: {
    status: HttpStatus.CREATED,
    description: 'user with access and refresh tokens',
    type: UserEntity,
  },
};

export const genNewTokenPair = {
  apiOperation: {
    summary: 'get new tokens',
  },
  apiResponse: {
    status: HttpStatus.OK,
    description: 'refresh access and refresh tokens',
  },
};

export const googleAuthRedirect = {
  apiOperation: {
    summary: 'redirect here users from GCP',
  },
  apiResponse: {
    status: HttpStatus.OK,
    description:
      'registered new or authorized user with access and refresh tokens',
  },
};

export const getGoogleAuthURL = {
  apiOperation: {
    summary: 'redirect from here to GCP',
  },
  apiResponse: {
    status: HttpStatus.MOVED_PERMANENTLY,
    description:
      'after login in google account user will be redirected to auth/google_redirect',
  },
};
