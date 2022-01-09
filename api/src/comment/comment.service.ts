import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { EditCommentDto } from './dto/edit-comment.dto';
import { CommentEntity } from './entities/comment.entity';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';
import { PostRepository } from '../post/post.repository';
import { CommentRepository } from './comment.repository';

@Injectable()
export class CommentService {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly commentRepository: CommentRepository,
    private readonly postRepository: PostRepository,
  ) {}

  async addNewComment(
    currentUserId: number,
    postToCommentId: string,
    createCommentDto: CreateCommentDto,
  ) {
    const newComment = await this.saveNewComment(
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

  async saveNewComment(
    currentUserId: number,
    postToCommentId: string,
    createCommentDto: CreateCommentDto,
  ) {
    const postToComment = await this.postRepository.findOnePost(
      +postToCommentId,
    );

    if (!postToComment) {
      throw new HttpException("post doesn't exist", HttpStatus.NOT_FOUND);
    }

    const newComment = new CommentEntity();
    newComment.user = currentUserId;
    newComment.post = +postToCommentId;
    newComment.text = createCommentDto.text;

    !createCommentDto.relatedUsers
      ? (newComment.relatedUsers = [])
      : (newComment.relatedUsers = createCommentDto.relatedUsers);

    return await this.commentRepository.saveComment(newComment);
  }

  async editComment(
    commentId: string,
    currentUserId: number,
    editCommentDto: EditCommentDto,
  ) {
    const commentToEdit = await this.commentRepository.getUsersComment(
      commentId,
      currentUserId,
    );

    Object.assign(commentToEdit, editCommentDto);
    await this.commentRepository.saveComment(commentToEdit);

    return commentToEdit;
  }

  async deleteComment(commentId: string, currentUserId: number) {
    const commentToDelete = await this.commentRepository.getUsersComment(
      commentId,
      currentUserId,
    );

    const { affected } = await this.commentRepository.deleteComment(
      commentToDelete.id,
    );

    return affected ? 'deleted successfully' : "can't find comment";
  }

  async findAllUserComments(currentUserId: number) {
    return await this.commentRepository.findAllUserComments(currentUserId);
  }
}
