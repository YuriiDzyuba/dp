import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';

export class UpdatePostDto {
  @ApiProperty({
    description: "post's title should be less than 55 symbols",
  })
  @IsOptional()
  @MinLength(5)
  @MaxLength(55)
  readonly title: string;

  @ApiProperty({
    description: 'main ideas',
  })
  @IsOptional()
  @MinLength(5)
  @MaxLength(55)
  readonly description: string;

  @ApiProperty({
    description: 'post text - should be less than 255 symbols',
  })
  @IsOptional()
  @MinLength(5)
  @MaxLength(255)
  @IsNotEmpty()
  readonly body: string;

  @ApiProperty({
    example: 'only jpeg or pmg files, allow only one image',
  })
  @IsOptional()
  image?: any;

  @ApiProperty({
    example: 'sepia',
    description:
      'optional field. name of image filter. allow only : sepia, black, multi, pink',
  })
  @IsOptional()
  readonly imageFilter?: string;

  @ApiProperty({
    example: '["supercars","ocean"]',
    description: 'optional field. array of words',
  })
  @IsOptional()
  readonly tagList?: string[];
}
