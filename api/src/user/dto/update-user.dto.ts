import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  readonly username?: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  readonly password?: string;

  readonly summary?: string;
}
