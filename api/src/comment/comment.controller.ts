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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { EditCommentDto } from './dto/edit-comment.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { User } from '../user/decorators/user.decorator';
import { CommentEntity } from './entities/comment.entity';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from 'src/user/user.service';
import { EmailService } from '../email/email.service';

@ApiTags('comment module')
@Controller('comment')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}

  @ApiOperation({ summary: 'add New Comment' })
  @ApiResponse({
    status: 201,
    description: 'add new comment to chosen in query post',
    type: CommentEntity,
  })
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @UseGuards(AuthGuard)
  async addNewComment(
    @User('id') currentUserId: number,
    @Query('post_id') postToCommentId: string,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<CommentEntity> {
    const newComment = await this.commentService.addNewComment(
      currentUserId,
      postToCommentId,
      createCommentDto,
    );

    if (!newComment.relatedUsers.length) {
      return newComment;
    }

    const getAllRelatedUsers = await this.userService.findUsersByNames(
      newComment.relatedUsers,
    );

    this.emailService.sendEmailToRelatedUsers(getAllRelatedUsers, newComment);

    return newComment;
  }

  @ApiOperation({ summary: 'edit coment' })
  @ApiResponse({
    status: 200,
    description: 'edit existing comment ',
    type: CommentEntity,
  })
  @Patch(':comment_id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
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

  @ApiOperation({ summary: 'delete comment by id' })
  @ApiResponse({
    status: 206,
    description: 'only owner can delete comment',
  })
  @Delete(':comment_id')
  @UseGuards(AuthGuard)
  deleteComment(
    @Param('comment_id') commentId: string,
    @User('id') currentUserId: number,
  ): Promise<any> {
    return this.commentService.deleteComment(commentId, currentUserId);
  }

  @ApiOperation({ summary: 'get all current user comments' })
  @ApiResponse({
    status: 206,
    description: "array off user's comments",
  })
  @Get()
  @UseGuards(AuthGuard)
  findAllUserComments(
    @User('id') currentUserId: number,
  ): Promise<CommentEntity[]> {
    return this.commentService.findAllUserComments(currentUserId);
  }
}
