import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PostEntity } from '../../post/entities/post.entity';
import { UserEntity } from '../../user/entities/user.entity';

@Entity({ name: 'comments' })
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Column({ default: '' })
  text: string;

  @Column()
  @Column('simple-array')
  relatedUsers: string[];

  @ManyToOne(() => PostEntity)
  post: number;

  @ManyToOne(() => UserEntity)
  user: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
