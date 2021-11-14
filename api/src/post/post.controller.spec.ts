import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { PostEntity } from './entities/post.entity';
import { FollowEntity } from '../profile/entities/follow.entity';
import { FileService } from '../file/file.service';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { CreatePostDto } from './dto/create-post.dto';
import testConfig from '../config/ormConfigTest';
import { getConnection } from 'typeorm';
import { UserModule } from '../user/user.module';
import e from 'express';
import { UpdatePostDto } from './dto/update-post.dto';
import { createUniqueString } from '../utils/createUniqueString';

describe('PostController', () => {
  let controller: PostController;
  let userService: UserService;

  const Location =
    'https://first-my-test-01-bucket-00.s3.us-east-2.amazonaws.com/leverx/posts/rtert-xulpeq.jpeg';

  const mockFileService = {
    prepareImage: jest.fn(() => {
      return 'verifiedImage';
    }),
    uploadNewImageToAWSs3: jest.fn(() => {
      return { Location };
    }),
  };

  const mockImageFile = 'image.jpeg';

  const mockUser: UserEntity = {
    username: 'Andrey',
    email: 'andrey44@mail.vgo',
    id: 1,
    password: 'qwerty',
    summary: '',
    avatar: '',
    createdAt: new Date(),
    posts: [],
    likedPosts: [],
    comments: [],
  };

  const mockNewUser: CreateUserDto = {
    username: `user-${createUniqueString()}`,
    email: `${createUniqueString()}@mail.vgo`,
    password: 'qwerty',
  };

  const mockNewPost: CreatePostDto = {
    title: 'It was popul 1960s ',
    description: 'survived not ce',
    body: 'survived not only five ce, remaining etraset shesages, with',
    tagList: ['release', 'five', 'into'],
    imageFilter: 'multi',
    image: '',
  };

  const mockPostToUpdate: UpdatePostDto = {
    title: 'Updated',
    description: 'Updated',
    body: 'Updated',
    tagList: ['Updated', 'five', 'into'],
    image: 'http//:Updated',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UserModule,
        TypeOrmModule.forFeature([UserEntity, PostEntity, FollowEntity]),
        TypeOrmModule.forRoot({
          ...testConfig,
          autoLoadEntities: true,
        }),
      ],
      controllers: [PostController],
      providers: [PostService, FileService],
    })
      .overrideProvider(FileService)
      .useValue(mockFileService)
      .compile();

    controller = module.get<PostController>(PostController);
    userService = module.get<UserService>(UserService);
    await userService.registerNewUser(mockNewUser);
  });

  afterAll(async () => {
    const connections = await getConnection();
    if (connections) {
      await connections.close();
    }
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return new post ', async () => {
    expect(
      await controller.createPost(mockUser, mockNewPost, mockImageFile as any),
    ).toMatchObject({
      title: 'It was popul 1960s ',
      description: 'survived not ce',
      body: 'survived not only five ce, remaining etraset shesages, with',
      tagList: ['release', 'five', 'into'],
      image: Location,
      favoriteCount: 0,
      author: mockUser,
    });
  });

  it('should have properties id, createdAt', async () => {
    expect(
      await controller.createPost(mockUser, mockNewPost, mockImageFile as any),
    ).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        createdAt: expect.any(Date),
      }),
    );
  });

  it('should update post', async () => {
    expect(
      await controller.editPostById(
        1,
        1,
        mockPostToUpdate,
        mockImageFile as any,
      ),
    ).toMatchObject(mockPostToUpdate);
  });

  it('should find posts by tag', async () => {
    expect(
      await controller.findManyPostsByTag(mockPostToUpdate.tagList[0]),
    ).toMatchObject([mockPostToUpdate]);
  });

  it('should return empty []', async () => {
    expect(await controller.findManyPostsByTag('unknownTag')).toEqual([]);
  });

  it('should find posts by id', async () => {
    expect(await controller.findOnePostsById(1)).toMatchObject(
      mockPostToUpdate,
    );
  });

  it('should throw error', async () => {
    try {
      expect(await controller.findOnePostsById(404)).toBe(false);
    } catch (e) {
      expect(e.message).toBe("post doesn't exist");
    }
  });

  it('should like post', async () => {
    expect(await controller.likePost(1, '1')).toMatchObject({
      ...mockPostToUpdate,
      favoriteCount: 1,
    });
  });

  it('should like dislike post', async () => {
    expect(await controller.disLikePost(1, '1')).toMatchObject({
      ...mockPostToUpdate,
      favoriteCount: 0,
    });
  });

  it('should throw error', async () => {
    try {
      expect(await controller.deletePost(1, '404')).toBe(false);
    } catch (e) {
      expect(e.message).toBe("can't find post");
    }
  });
});
