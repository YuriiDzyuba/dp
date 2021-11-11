import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { EditCommentDto } from './dto/edit-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from '../post/entities/post.entity';
import { getRepository, Repository } from 'typeorm';
import { CommentEntity } from './entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  async addNewComment(
    currentUserId: number,
    postToCommentId: string,
    createCommentDto: CreateCommentDto,
  ) {
    const postToComment = await this.postRepository.findOne(+postToCommentId);

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

    return await this.commentRepository.save(newComment);
  }

  async editComment(
    commentId: string,
    currentUserId: number,
    editCommentDto: EditCommentDto,
  ) {
    const commentToEdit = await this._getUsersComment(commentId, currentUserId);

    Object.assign(commentToEdit, editCommentDto);
    await this.commentRepository.save(commentToEdit);

    return commentToEdit;
  }

  async deleteComment(commentId: string, currentUserId: number) {
    console.log(commentId, 'ggggggggggggggggggggggggggggggggggggg');
    console.log(currentUserId, 'ggggggggggggggggggggggggggggggggggggg');
    const commentToDelete = await this._getUsersComment(
      commentId,
      currentUserId,
    );

    const { affected } = await this.commentRepository.delete({
      id: commentToDelete.id,
    });

    return affected ? 'deleted successfully' : "can't find comment";
  }

  async _getUsersComment(commentId: string, currentUserId: number) {
    const comment = await getRepository(CommentEntity)
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('user.id = :id', { id: currentUserId })
      .andWhere('comment.id = :comment_id', { comment_id: +commentId })
      .getOne();

    if (!comment) {
      throw new HttpException(
        { message: "cant't find comment" },
        HttpStatus.BAD_REQUEST,
      );
    }

    return comment;
  }

  async findAllUserComments(currentUserId: number) {
    return await getRepository(CommentEntity)
      .createQueryBuilder('comment')
      .leftJoin('comment.user', 'user')
      .where('user.id = :id', { id: currentUserId })
      .getMany();
  }
}
