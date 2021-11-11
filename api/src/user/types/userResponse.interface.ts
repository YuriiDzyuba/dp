import { UserType } from './user.type';

export interface UserResponseInterface extends UserType {
  readonly accessToken: string;
  readonly refreshToken: string;
}
