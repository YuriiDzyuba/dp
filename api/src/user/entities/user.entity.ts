import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostEntity } from '../../post/entities/post.entity';
import { CommentEntity } from '../../comment/entities/comment.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Column({ unique: true })
  email: string;

  @Column()
  @Column({ unique: true })
  username: string;

  @Column({ default: '' })
  summary: string;

  @Column({ default: '' })
  avatar: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => PostEntity, (post) => post.author)
  posts: PostEntity[];

  @ManyToMany(() => PostEntity)
  @JoinTable()
  likedPosts: PostEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.user)
  comments: CommentEntity[];
}
