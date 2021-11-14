import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PostEntity } from '../../post/entities/post.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { ApiProperty, ApiTags } from '@nestjs/swagger';

@ApiTags('comments')
@Entity({ name: 'comments' })
export class CommentEntity {
  @ApiProperty({ example: 2, description: 'primary generated column' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'good post', description: "coment's text" })
  @Column()
  @Column({ default: '' })
  text: string;

  @ApiProperty({
    example: '["Jon" "Anna"]',
    description: 'users mentioned in comment',
  })
  @Column()
  @Column('simple-array')
  relatedUsers: string[];

  @ApiProperty({
    example: 'id:345',
    description: 'target post',
  })
  @ManyToOne(() => PostEntity)
  post: number;

  @ApiProperty({
    example: 'Max',
    description: 'author of current comment ',
  })
  @ManyToOne(() => UserEntity)
  user: number;

  @ApiProperty({
    example: '23423423423434',
    description: 'Date stamp',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
