import { IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  readonly text: string;

  readonly relatedUsers?: string[];
}
