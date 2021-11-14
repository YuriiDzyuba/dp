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
  HttpException,
  HttpStatus,
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
import { FileService } from '../file/file.service';
import { UpdatePostDto } from './dto/update-post.dto';

@ApiTags('posts module')
@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly fileService: FileService,
  ) {}

  @ApiOperation({ summary: 'create new post' })
  @ApiResponse({
    status: 201,
    type: PostEntity,
  })
  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @UseInterceptors(FileInterceptor('image'))
  async createPost(
    @User() currentUser: UserEntity,
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() image: Express.Multer.File,
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

    const newPost = await this.postService.createPost(
      currentUser,
      createPostDto,
    );

    return newPost;
  }

  @ApiOperation({ summary: 'update post' })
  @ApiResponse({
    status: 200,
    type: PostEntity,
  })
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

    const updatedPost = await this.postService.editPostById(
      currentUserId,
      updatePostDto,
      postToUpdateId,
    );

    return updatedPost;
  }

  @ApiOperation({ summary: 'get all own and following user posts' })
  @ApiResponse({
    status: 200,
    type: [PostEntity],
  })
  @Get('/user/:user_id')
  @UseGuards(AuthGuard)
  async getUserNewsPage(
    @Param('user_id') currentUserId: number,
    @Query() query: string,
  ): Promise<PostEntity[]> {
    return await this.postService.getUserNewsPage(currentUserId, query);
  }

  @ApiOperation({ summary: 'find all posts by tag' })
  @ApiResponse({
    status: 200,
    type: [PostEntity],
  })
  @Get(':tag')
  @UseGuards(AuthGuard)
  findManyPostsByTag(@Param('tag') tag: string) {
    return this.postService.findManyPostsByTag(tag);
  }

  @ApiOperation({ summary: 'find one post by id' })
  @ApiResponse({
    status: 200,
    type: [PostEntity],
  })
  @Get(':id')
  @UseGuards(AuthGuard)
  findOnePostsById(@Param('id') id: number) {
    return this.postService.findPostById(id);
  }

  @ApiOperation({ summary: 'find by id and delete post' })
  @ApiResponse({
    status: 206,
  })
  @Delete(':post_id')
  @UseGuards(AuthGuard)
  async deletePost(
    @User('id') currentUserId: number,
    @Param('post_id') postToDeleteId: string,
  ) {
    return this.postService.deletePost(currentUserId, postToDeleteId);
  }

  @ApiOperation({ summary: 'like post' })
  @ApiResponse({
    status: 206,
    type: [PostEntity],
  })
  @Post('like/:post_id')
  @UseGuards(AuthGuard)
  likePost(
    @User('id') currentUserId: number,
    @Param('post_id') postToLikeId: string,
  ) {
    return this.postService.likePost(currentUserId, postToLikeId);
  }

  @ApiOperation({ summary: 'dislike post' })
  @ApiResponse({
    status: 206,
  })
  @Delete('like/:post_id')
  @UseGuards(AuthGuard)
  disLikePost(
    @User('id') currentUserId: number,
    @Param('post_id') postToDislikeId: string,
  ) {
    return this.postService.disLikePost(currentUserId, postToDislikeId);
  }
}
