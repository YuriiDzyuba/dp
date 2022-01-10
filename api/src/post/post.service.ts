import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UserEntity } from '../user/entities/user.entity';
import { PostEntity } from './entities/post.entity';
import { UpdatePostDto } from './dto/update-post.dto';
import { ProfileRepository } from '../profile/profile.repository';
import { UserRepository } from '../user/user.repository';
import { PostRepository } from './post.repository';
import { FileService } from '../file/file.service';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly userRepository: UserRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly fileService: FileService,
  ) {}

  async creteNewPost(
    currentUser: UserEntity,
    createPostDto: CreatePostDto,
    image,
  ): Promise<PostEntity> {
    const verifiedImage = await this.fileService.prepareImage(
      image,
      createPostDto.imageFilter,
    );

    const { Location } = await this.fileService.uploadNewImageToAWSs3(
      verifiedImage,
      'posts',
    );

    if (!Location) {
      throw new HttpException(
        'image size must be less than 3MB',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    createPostDto.image = Location;

    return await this.createPost(currentUser, createPostDto);
  }

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

  async editPost(
    postToUpdateId: number,
    currentUserId: number,
    updatePostDto: UpdatePostDto,
    image,
  ): Promise<PostEntity> {
    if (image) {
      const verifiedImage = await this.fileService.prepareImage(
        image,
        updatePostDto.imageFilter,
      );

      const { Location } = await this.fileService.uploadNewImageToAWSs3(
        verifiedImage,
        'posts',
      );

      if (!Location) {
        throw new HttpException(
          'image size must be less than 3MB',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      updatePostDto.image = Location;
    }

    const updatedPost = await this.editPostById(
      currentUserId,
      updatePostDto,
      postToUpdateId,
    );

    return updatedPost;
  }

  async editPostById(
    currentUserId: number,
    updatePostDto: UpdatePostDto,
    postToUpdateId: number,
  ): Promise<PostEntity> {
    const postToUpdate = await this.postRepository.getOnePostToUpdate(
      currentUserId,
      +postToUpdateId,
    );

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

    return await this.profileRepository.getNewsPage(query, followingUserIds);
  }

  async findManyPostsByTag(tag: string) {
    return await this.postRepository.findManyPostsByTag(tag);
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
