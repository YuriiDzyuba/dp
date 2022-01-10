import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UserEntity } from '../user/entities/user.entity';
import { PostEntity } from './entities/post.entity';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostRepository } from './post.repository';
import { FileService } from '../file/file.service';
import { UserService } from '../user/user.service';
import { ProfileService } from '../profile/profile.service';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
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

    return await this.editPostById(
      currentUserId,
      updatePostDto,
      postToUpdateId,
    );
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
    const followingUsers = await this.profileService.findFollowingUsers(
      pageOwnerUserId,
    );

    if (!followingUsers.length) {
      return [];
    }

    const followingUserIds = followingUsers.map((follow) => follow.followingId);
    followingUserIds.push(+pageOwnerUserId);

    return await this.postRepository.getNewsPage(query, followingUserIds);
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
      throw new HttpException('access denied', HttpStatus.FORBIDDEN);
    }

    return await this.postRepository.deleteOnePost(+postToDeleteId);
  }

  async likePost(currentUserId: number, postToLikeId: string) {
    const postToLike = await this.findPostById(+postToLikeId);

    const user = await this.userService.findOneUserWithLikedPosts(
      currentUserId,
    );

    if (!user) {
      throw new HttpException('wrong user id', HttpStatus.BAD_REQUEST);
    }

    const postIndex = user.likedPosts.findIndex(
      (postInLikedPosts) => postInLikedPosts.id === postToLike.id,
    );

    if (postIndex === -1) {
      user.likedPosts.push(postToLike);
      postToLike.favoriteCount++;
      await this.userService.saveUser(user);
      await this.postRepository.savePost(postToLike);
    }

    return postToLike;
  }

  async disLikePost(currentUserId: number, postToDislikeId: string) {
    const postToDislike = await this.findPostById(+postToDislikeId);

    const user = await this.userService.findOneUserWithLikedPosts(
      currentUserId,
    );

    if (!user) {
      throw new HttpException('wrong user id', HttpStatus.BAD_REQUEST);
    }

    const postIndex = user.likedPosts.findIndex(
      (postInLikedPosts) => postInLikedPosts.id === postToDislike.id,
    );

    if (postIndex >= 0) {
      user.likedPosts.splice(postIndex, 1);
      postToDislike.favoriteCount--;
      await this.userService.saveUser(user);
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
