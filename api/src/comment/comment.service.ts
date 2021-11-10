import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from '../post/entities/post.entity';
import { Repository } from 'typeorm';
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

  async findAll() {
    return await this.commentRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}
