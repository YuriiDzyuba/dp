import { IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    example: 'new post about my life',
    description: "post's title should be less than 55 symbols",
  })
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(55)
  readonly title: string;

  @ApiProperty({
    example: "I woke up at 6 o'clock",
    description: 'main ideas',
  })
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(55)
  readonly description: string;

  @ApiProperty({
    example:
      'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of ',
    description: 'post text - should be less than 255 symbols',
  })
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  readonly body: string;

  @ApiProperty({
    example: 'only jpeg or pmg files, allow only one image',
  })
  @IsOptional()
  image?: string;

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
