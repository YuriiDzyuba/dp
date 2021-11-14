import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UserEntity } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { PostEntity } from './entities/post.entity';
import { FollowEntity } from '../profile/entities/follow.entity';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
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

    return await this.postRepository.save(postToUpdate);
  }

  async getUserNewsPage(
    pageOwnerUserId: number,
    query: any,
  ): Promise<PostEntity[]> {
    const followingUsers = await this.followRepository.find({
      followerId: pageOwnerUserId,
    });

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
    const postToDelete = await this.postRepository.findOne(+postToDeleteId, {
      loadRelationIds: true,
    });

    if (!postToDelete) {
      throw new HttpException("can't find post", HttpStatus.FORBIDDEN);
    }

    if (Number(postToDelete.author) !== currentUserId) {
      throw new HttpException('access denied ', HttpStatus.FORBIDDEN);
    }

    return await this.postRepository.delete({ id: +postToDeleteId });
  }

  async likePost(currentUserId: number, postToLikeId: string) {
    const postToLike = await this.findPostById(+postToLikeId);

    if (!postToLike) {
      throw new HttpException('wrong post id', HttpStatus.BAD_REQUEST);
    }

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

    if (!postToDislike) {
      throw new HttpException('wrong post id', HttpStatus.BAD_REQUEST);
    }

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
