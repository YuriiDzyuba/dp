import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UserEntity } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { PostEntity } from './entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createPost(
    currentUser: UserEntity,
    createPostDto: CreatePostDto,
  ): Promise<PostEntity> {
    const post = new PostEntity();
    Object.assign(post, createPostDto);

    if (!post.tagList) {
      post.tagList = [];
    }

    post.author = currentUser;

    return await this.postRepository.save(post);
  }

  async findAllPosts() {
    return await this.postRepository.find();
  }

  async findManyPostsByTag(tag: string) {
    const queryBuilder = getRepository(PostEntity)
      .createQueryBuilder('posts')
      .leftJoinAndSelect('posts.author', 'author')
      .where('posts.tagList LIKE :tag', {
        tag: `%${tag}%`,
      });

    const posts = await queryBuilder.getMany();
    const postsCount = await queryBuilder.getCount();

    return { posts, postsCount };
  }

  async deletePost(currentUserId: number, postToDeleteId: string) {
    const postToDelete = await this.findPostById(+postToDeleteId);

    if (postToDelete.author.id !== currentUserId) {
      throw new HttpException('access denied ', HttpStatus.FORBIDDEN);
    }

    return await this.postRepository.delete({ id: +postToDeleteId });
  }

  async likePost(currentUserId: number, postToDeleteId: string) {
    const postToLike = await this.findPostById(+postToDeleteId);
    const user = await this.userRepository.findOne(currentUserId, {
      relations: ['likedPosts'],
    });

    const postIndex = user.likedPosts.findIndex(
      (postInLikedPosts) => postInLikedPosts.id === postToLike.id,
    );

    if (postIndex === -1) {
      user.likedPosts.push(postToLike);
      postToLike.favoriteCount++;
      await this.userRepository.save(user);
      await this.postRepository.save(postToLike);
    }

    return postToLike;
  }

  async disLikePost(currentUserId: number, postToDislikeId: string) {
    const postToDislike = await this.findPostById(+postToDislikeId);
    const user = await this.userRepository.findOne(currentUserId, {
      relations: ['likedPosts'],
    });

    const postIndex = user.likedPosts.findIndex(
      (postInLikedPosts) => postInLikedPosts.id === postToDislike.id,
    );

    if (postIndex >= 0) {
      user.likedPosts.splice(postIndex, 1);
      postToDislike.favoriteCount--;
      await this.userRepository.save(user);
      await this.postRepository.save(postToDislike);
    }

    return postToDislike;
  }

  async findPostById(id: number) {
    const postById = await this.postRepository.findOne(id);

    if (!postById) {
      throw new HttpException("post doesn't exist", HttpStatus.NOT_FOUND);
    }

    return postById;
  }
}
