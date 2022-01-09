import { HttpStatus } from '@nestjs/common';
import { UserEntity } from '../../user/entities/user.entity';

export const findUserById = {
  apiOperation: {
    summary: 'find one user by id',
  },
  apiResponse: {
    status: 200,
    description: 'founded user',
    type: UserEntity,
  },
};

export const registerNewUser = {
  apiOperation: {
    summary: 'create new user by email and password',
  },
  apiResponse: {
    status: 201,
    description: 'created new user',
    type: UserEntity,
  },
};

export const updateCurrentUser = {
  apiOperation: {
    summary: 'update current user ',
  },
  apiResponse: {
    status: 200,
    description: 'updated user',
    type: UserEntity,
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
