import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UserEntity } from '../user/entities/user.entity';
import { getRepository } from 'typeorm';
import { PostEntity } from './entities/post.entity';
import { UpdatePostDto } from './dto/update-post.dto';
import { ProfileRepository } from '../profile/profile.repository';
import { UserRepository } from '../user/user.repository';
import { PostRepository } from './post.repository';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly userRepository: UserRepository,
    private readonly profileRepository: ProfileRepository,
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

    return await this.postRepository.savePost(post);
  }

  async editPostById(
    currentUserId: number,
    updatePostDto: UpdatePostDto,
    postToUpdateId: number,
  ): Promise<PostEntity> {
    const postToUpdate = await getRepository(PostEntity)
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('author.id = :id', { id: currentUserId })
      .andWhere('post.id = :post_id', { post_id: +postToUpdateId })
      .getOne();

    if (!postToUpdate) {
      throw new HttpException(
        { message: "can't find post" },
        HttpStatus.BAD_REQUEST,
      );
    }

    Object.assign(postToUpdate, updatePostDto);

    return await this.postRepository.savePost(postToUpdate);
  }

  async getUserNewsPage(
    pageOwnerUserId: number,
    query: any,
  ): Promise<PostEntity[]> {
    const followingUsers = await this.profileRepository.findFollowingUsers(
      pageOwnerUserId,
    );

    if (!followingUsers.length) {
      return [];
    }

    const followingUserIds = followingUsers.map((follow) => follow.followingId);
    followingUserIds.push(+pageOwnerUserId);

    const queryBuilder = getRepository(PostEntity)
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.authorId IN (:...ids)', { ids: followingUserIds })
      .orderBy('post.createdAt', 'DESC');

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    return await queryBuilder.getMany();
  }

  async findManyPostsByTag(tag: string) {
    const queryBuilder = getRepository(PostEntity)
      .createQueryBuilder('posts')
      .where('posts.tagList LIKE :tag', {
        tag: `%${tag}%`,
      });

    const posts = await queryBuilder.getMany();

    return posts;
  }

  async deletePost(currentUserId: number, postToDeleteId: string) {
    const postToDelete = await this.postRepository.findOnePostWithAuthorId(
      +postToDeleteId,
    );

    if (!postToDelete) {
      throw new HttpException("can't find post", HttpStatus.FORBIDDEN);
    }

    if (Number(postToDelete.author) !== currentUserId) {
      throw new HttpException('access denied ', HttpStatus.FORBIDDEN);
    }

    return await this.postRepository.deleteOnePost(+postToDeleteId);
  }

  async likePost(currentUserId: number, postToLikeId: string) {
    const postToLike = await this.findPostById(+postToLikeId);

    if (!postToLike) {
      throw new HttpException('wrong post id', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.findOneUserWithLikedPosts(
      currentUserId,
    );

    const postIndex = user.likedPosts.findIndex(
      (postInLikedPosts) => postInLikedPosts.id === postToLike.id,
    );

    if (postIndex === -1) {
      user.likedPosts.push(postToLike);
      postToLike.favoriteCount++;
      await this.userRepository.saveUser(user);
      await this.postRepository.savePost(postToLike);
    }

    return postToLike;
  }

  async disLikePost(currentUserId: number, postToDislikeId: string) {
    const postToDislike = await this.findPostById(+postToDislikeId);

    if (!postToDislike) {
      throw new HttpException('wrong post id', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.findOneUserWithLikedPosts(
      currentUserId,
    );

    const postIndex = user.likedPosts.findIndex(
      (postInLikedPosts) => postInLikedPosts.id === postToDislike.id,
    );

    if (postIndex >= 0) {
      user.likedPosts.splice(postIndex, 1);
      postToDislike.favoriteCount--;
      await this.userRepository.saveUser(user);
      await this.postRepository.savePost(postToDislike);
    }

    return postToDislike;
  }

  async findPostById(id: number) {
    const postById = await this.postRepository.findOnePost(id);

    if (!postById) {
      throw new HttpException("post doesn't exist", HttpStatus.NOT_FOUND);
    }

    return postById;
  }
}
