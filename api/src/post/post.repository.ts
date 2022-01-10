import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { getRepository, Repository } from 'typeorm';
import { FollowEntity } from '../profile/entities/follow.entity';

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

  async getOnePostToUpdate(currentUserId, postToUpdateId): Promise<PostEntity> {
    return await getRepository(PostEntity)
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('author.id = :id', { id: currentUserId })
      .andWhere('post.id = :post_id', { post_id: +postToUpdateId })
      .getOne();
  }

  async findManyPostsByTag(tag: string): Promise<PostEntity[]> {
    const queryBuilder = getRepository(PostEntity)
      .createQueryBuilder('posts')
      .where('posts.tagList LIKE :tag', {
        tag: `%${tag}%`,
      });

    return await queryBuilder.getMany();
  }
}
