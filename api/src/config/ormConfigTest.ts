import { ConnectionOptions } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { PostEntity } from '../post/entities/post.entity';
import { CommentEntity } from '../comment/entities/comment.entity';
import { FollowEntity } from '../profile/entities/follow.entity';

const testConfig: ConnectionOptions = {
  //url: process.env.DATABASE_URL,
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '8848',
  database: 'test',
  entities: [UserEntity, PostEntity, CommentEntity, FollowEntity],
  synchronize: true,
};
export default testConfig;
