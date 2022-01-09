import { HttpStatus } from '@nestjs/common';
import { UserEntity } from '../../user/entities/user.entity';

export const findOneProfile = {
  apiOperation: {
    summary: 'find one user profile by user id (public route)',
  },
  apiResponse: {
    status: 200,
    description: 'founded user profile',
  },
};

export const followProfile = {
  apiOperation: {
    summary: 'subscribe to user profile',
  },
  apiResponse: {
    status: 200,
  },
};

export const unFollowProfile = {
  apiOperation: {
    summary: 'unsubscribe from user profile',
  },
  apiResponse: {},
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
