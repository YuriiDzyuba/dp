import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(PostEntity)
    private readonly post: Repository<PostEntity>,
  ) {}

  async savePost(postToSave): Promise<PostEntity> {
    return await this.post.save(postToSave);
  }

  async findOnePostWithAuthorId(postId) {
    return await this.post.findOne(postId, {
      loadRelationIds: true,
    });
  }

  async deleteOnePost(postId: number) {
    return await this.post.delete({ id: postId });
  }

  async findOnePost(id: number): Promise<PostEntity> {
    return await this.post.findOne(id);
  }
}
