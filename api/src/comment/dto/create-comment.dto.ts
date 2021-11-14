import { IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    example: 'very good post',
    description: 'should be less than 255symbols',
  })
  @MinLength(2)
  @MaxLength(255)
  @IsNotEmpty()
  readonly text: string;

  @IsOptional()
  @ApiProperty({
    example: '["Jon","Doe"]',
    description: 'array of user names  who should will be informed',
  })
  @MinLength(2, { each: true })
  @MaxLength(22, { each: true })
  readonly relatedUsers?: string[];
}
