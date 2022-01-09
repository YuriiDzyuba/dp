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
import {
  addNewComment,
  deleteComment,
  editComment,
  findAllUserComments,
} from './consts/comment.swagger.consts';

@ApiTags('comment module')
@Controller('comment')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}

  @ApiOperation(addNewComment.apiResponse)
  @ApiResponse(addNewComment.apiResponse)
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

  @ApiOperation(editComment.apiOperation)
  @ApiResponse(editComment.apiResponse)
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

  @ApiOperation(deleteComment.apiOperation)
  @ApiResponse(deleteComment.apiResponse)
  @Delete(':comment_id')
  @UseGuards(AuthGuard)
  deleteComment(
    @Param('comment_id') commentId: string,
    @User('id') currentUserId: number,
  ): Promise<any> {
    return this.commentService.deleteComment(commentId, currentUserId);
  }

  @ApiOperation(findAllUserComments.apiOperation)
  @ApiResponse(findAllUserComments.apiResponse)
  @Get()
  @UseGuards(AuthGuard)
  findAllUserComments(
    @User('id') currentUserId: number,
  ): Promise<CommentEntity[]> {
    return this.commentService.findAllUserComments(currentUserId);
  }
}
