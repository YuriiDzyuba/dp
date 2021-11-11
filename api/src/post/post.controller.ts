import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UserEntity } from '../user/entities/user.entity';
import { User } from '../user/decorators/user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PostEntity } from './entities/post.entity';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async createPost(
    @User() currentUser: UserEntity,
    @Body() createPostDto: CreatePostDto,
  ): Promise<PostEntity> {
    const newPost = await this.postService.createPost(
      currentUser,
      createPostDto,
    );

    return newPost;
  }

  @Get()
  async findAllPosts() {
    return this.postService.findAllPosts();
  }

  @Get(':tag')
  findManyPostsByTag(@Param('tag') tag: string) {
    return this.postService.findManyPostsByTag(tag);
  }

  @Delete(':post_id')
  @UseGuards(AuthGuard)
  async deletePost(
    @User('id') currentUserId: number,
    @Param('post_id') postToDeleteId: string,
  ) {
    return this.postService.deletePost(currentUserId, postToDeleteId);
  }

  @Post(':post_id/like')
  @UseGuards(AuthGuard)
  likePost(
    @User('id') currentUserId: number,
    @Param('post_id') postToLikeId: string,
  ) {
    return this.postService.likePost(currentUserId, postToLikeId);
  }

  @Delete(':post_id/dislike')
  @UseGuards(AuthGuard)
  disLikePost(
    @User('id') currentUserId: number,
    @Param('post_id') postToDislikeId: string,
  ) {
    return this.postService.disLikePost(currentUserId, postToDislikeId);
  }

  // @Post(':post_id/add_comment')
  // @UseGuards(AuthGuard)
  // addCommentToPost(
  //   @User('id') currentUserId: number,
  //   @Param('post_id') postToLikeId: string,
  // ) {
  //   return this.postService.addCommentToPost(currentUserId, postToLikeId);
  // }
  //
  // @Delete(':post_id/delete_comment')
  // @UseGuards(AuthGuard)
  // deleteCommentToPost(
  //   @User('id') currentUserId: number,
  //   @Param('post_id') postToDislikeId: string,
  // ) {
  //   return this.postService.deleteCommentToPost(currentUserId, postToDislikeId);
  // }
}
