import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PostEntity } from '../../post/entities/post.entity';

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
  description: string;

  @Column({ default: '' })
  image: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => PostEntity, (post) => post.author)
  posts: PostEntity[];
}
