import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { CommentEntity } from './entities/comment.entity';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly comment: Repository<CommentEntity>,
  ) {}

  async saveComment(commentToSave) {
    return await this.comment.save(commentToSave);
  }

  async deleteComment(commentId) {
    return await this.comment.delete({
      id: commentId,
    });
  }

  async getUsersComment(commentId: string, currentUserId: number) {
    const comment = await getRepository(CommentEntity)
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('user.id = :id', { id: currentUserId })
      .andWhere('comment.id = :comment_id', { comment_id: +commentId })
      .getOne();

    if (!comment) {
      throw new HttpException(
        { message: "can't find comment" },
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
