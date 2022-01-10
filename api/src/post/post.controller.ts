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
  Query,
  UseInterceptors,
  UploadedFile,
  Patch,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UserEntity } from '../user/entities/user.entity';
import { User } from '../user/decorators/user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PostEntity } from './entities/post.entity';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdatePostDto } from './dto/update-post.dto';
import {
  createPost,
  deletePost,
  disLikePost,
  editPostById,
  findManyPostsByTag,
  findOnePostsById,
  getUserNewsPage,
  likePost,
} from './consts/post.swagger.consts';

@ApiTags('posts module')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @ApiOperation(createPost.apiOperation)
  @ApiResponse(createPost.apiResponse)
  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @UseInterceptors(FileInterceptor('image'))
  async createPost(
    @User() currentUser: UserEntity,
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<PostEntity> {
    return this.postService.creteNewPost(currentUser, createPostDto, image);
  }

  @ApiOperation(editPostById.apiOperation)
  @ApiResponse(editPostById.apiResponse)
  @Patch('/:post_id')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @UseInterceptors(FileInterceptor('image'))
  async editPostById(
    @Param('post_id') postToUpdateId: number,
    @User('id') currentUserId: number,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<PostEntity> {
    return this.postService.editPost(
      postToUpdateId,
      currentUserId,
      updatePostDto,
      image,
    );
  }

  @ApiOperation(getUserNewsPage.apiOperation)
  @ApiResponse(editPostById.apiResponse)
  @Get('/user/:user_id')
  @UseGuards(AuthGuard)
  async getUserNewsPage(
    @Param('user_id') currentUserId: number,
    @Query() query: string,
  ): Promise<PostEntity[]> {
    return await this.postService.getUserNewsPage(currentUserId, query);
  }

  @ApiOperation(findManyPostsByTag.apiOperation)
  @ApiResponse(findManyPostsByTag.apiResponse)
  @Get(':tag')
  @UseGuards(AuthGuard)
  findManyPostsByTag(@Param('tag') tag: string) {
    return this.postService.findManyPostsByTag(tag);
  }

  @ApiOperation(findOnePostsById.apiOperation)
  @ApiResponse(findOnePostsById.apiResponse)
  @Get(':id')
  @UseGuards(AuthGuard)
  findOnePostsById(@Param('id') id: number) {
    return this.postService.findPostById(id);
  }

  @ApiOperation(deletePost.apiOperation)
  @ApiResponse(deletePost.apiResponse)
  @Delete(':post_id')
  @UseGuards(AuthGuard)
  async deletePost(
    @User('id') currentUserId: number,
    @Param('post_id') postToDeleteId: string,
  ) {
    return this.postService.deletePost(currentUserId, postToDeleteId);
  }

  @ApiOperation(likePost.apiOperation)
  @ApiResponse(likePost.apiResponse)
  @Post('like/:post_id')
  @UseGuards(AuthGuard)
  likePost(
    @User('id') currentUserId: number,
    @Param('post_id') postToLikeId: string,
  ) {
    return this.postService.likePost(currentUserId, postToLikeId);
  }

  @ApiOperation(disLikePost.apiOperation)
  @ApiResponse(disLikePost.apiResponse)
  @Delete('like/:post_id')
  @UseGuards(AuthGuard)
  disLikePost(
    @User('id') currentUserId: number,
    @Param('post_id') postToDislikeId: string,
  ) {
    return this.postService.disLikePost(currentUserId, postToDislikeId);
  }
}
