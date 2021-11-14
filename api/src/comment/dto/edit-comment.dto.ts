import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';

export class EditCommentDto {
  @ApiProperty({
    example: 'very good post',
    description: 'should be less than 255symbols',
  })
  @IsOptional()
  @MinLength(2)
  @MaxLength(255)
  readonly text: string;

  @ApiProperty({
    example: '["Jon","Doe"]',
    description: 'array of user names  who should will be informed',
  })
  @IsOptional()
  @MinLength(2, { each: true })
  @MaxLength(22, { each: true })
  readonly relatedUsers?: string[];
}
