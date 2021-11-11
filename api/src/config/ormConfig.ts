import { ConnectionOptions } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { PostEntity } from '../post/entities/post.entity';
import { CommentEntity } from '../comment/entities/comment.entity';
import * as path from 'path';

const config: ConnectionOptions = {
  //url: process.env.DATABASE_URL,
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'instagramuser',
  password: '8848',
  database: 'instagram',
  entities: [UserEntity, PostEntity, CommentEntity],
  synchronize: false,
  migrations: [path.join(__dirname + '../../migrations/**/*{.ts,.js}')], //?
  cli: {
    migrationsDir: 'src/migrations',
  },
};
export default config;