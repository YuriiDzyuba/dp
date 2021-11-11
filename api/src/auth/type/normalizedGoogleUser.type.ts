import { UserEntity } from '../../user/entities/user.entity';

export type NormalizedGoogleUserType = Pick<
  UserEntity,
  'email' | 'username' | 'avatar' | 'password'
>;
