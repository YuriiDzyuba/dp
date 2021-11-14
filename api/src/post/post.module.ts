import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { UserEntity } from '../user/entities/user.entity';
import { FollowEntity } from '../profile/entities/follow.entity';
import { FileModule } from '../file/file.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity, UserEntity, FollowEntity]),
    FileModule,
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
