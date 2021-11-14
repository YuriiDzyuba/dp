import { Request } from 'express';
import { UserEntity } from '../user/entities/user.entity';
import { ImageType } from '../file/types/image.type';

export interface ExpressRequestInterface extends Request {
  currentUser?: UserEntity;
  userToRefreshTokens?: UserEntity;
}
