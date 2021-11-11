import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { EditCommentDto } from './dto/edit-comment.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { User } from '../user/decorators/user.decorator';
import { CommentEntity } from './entities/comment.entity';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(AuthGuard)
  addNewComment(
    @User('id') currentUserId: number,
    @Query('post_id') postToCommentId: string,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<CommentEntity> {
    return this.commentService.addNewComment(
      currentUserId,
      postToCommentId,
      createCommentDto,
    );
  }

  @Patch(':comment_id')
  @UseGuards(AuthGuard)
  editComment(
    @Param('comment_id') commentId: string,
    @User('id') currentUserId: number,
    @Body() editCommentDto: EditCommentDto,
  ): Promise<CommentEntity> {
    return this.commentService.editComment(
      commentId,
      currentUserId,
      editCommentDto,
    );
  }

  @Delete(':comment_id')
  @UseGuards(AuthGuard)
  deleteComment(
    @Param('comment_id') commentId: string,
    @User('id') currentUserId: number,
  ): Promise<any> {
    return this.commentService.deleteComment(commentId, currentUserId);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAllUserComments(
    @User('id') currentUserId: number,
  ): Promise<CommentEntity[]> {
    return this.commentService.findAllUserComments(currentUserId);
  }
}
