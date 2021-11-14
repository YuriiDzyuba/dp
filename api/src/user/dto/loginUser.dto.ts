import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ example: 'pol@mail.de', description: 'user email' })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({ example: 'sdQd3gD', description: 'user password' })
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(16)
  readonly password: string;
}
