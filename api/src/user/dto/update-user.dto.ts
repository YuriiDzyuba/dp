import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'pol14', description: 'nicname - should be unique' })
  @MinLength(2)
  @MaxLength(22)
  readonly username?: string;

  @ApiProperty({ example: 'sdQd3gD', description: 'user password' })
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(16)
  readonly summary?: string;

  @ApiProperty({ description: 'should be empty' })
  avatar?: string;
}
