import { ConnectionOptions } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { PostEntity } from '../post/entities/post.entity';
import { CommentEntity } from '../comment/entities/comment.entity';
import * as path from 'path';
import { FollowEntity } from '../profile/entities/follow.entity';

const config: ConnectionOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [UserEntity, PostEntity, CommentEntity, FollowEntity],
  synchronize: false,
  migrations: [path.join(__dirname + '../../migrations/**/*{.ts,.js}')], //?
  cli: {
    migrationsDir: 'src/migrations',
  },
};
export default config;
