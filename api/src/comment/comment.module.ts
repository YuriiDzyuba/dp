import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from './entities/comment.entity';
import { PostEntity } from '../post/entities/post.entity';
import { UserModule } from '../user/user.module';
import { EmailModule } from '../email/email.module';
import { PostModule } from '../post/post.module';
import { CommentRepository } from './comment.repository';

@Module({
  imports: [
    UserModule,
    EmailModule,
    PostModule,
    TypeOrmModule.forFeature([CommentEntity, PostEntity]),
  ],
  controllers: [CommentController],
  providers: [CommentRepository, CommentService],
})
export class CommentModule {}
