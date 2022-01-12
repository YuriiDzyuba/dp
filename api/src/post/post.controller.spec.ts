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
import { UpdatePostDto } from './dto/update-post.dto';
import { createUniqueString } from '../utils/createUniqueString';
import { PostRepository } from './post.repository';
import { ProfileModule } from '../profile/profile.module';
import { FileModule } from '../file/file.module';
import { UserType } from '../user/types/user.type';
import { INTEGRATION_TEST_ERR } from '../consts/test.consts';

describe('PostController', () => {
  let controller: PostController;
  let userService: UserService;
  let savedUser: UserType;

  const Location = 'https://first-mom/posts/rtert-xulpeq.jpeg';

  const mockImageFile = 'image.jpeg';

  const mockBigImageFile = 'some big binary file';

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
    image: Location,
  };

  const mockPostToUpdate: UpdatePostDto = {
    title: 'Updated',
    description: 'Updated',
    body: 'Updated',
    tagList: ['Updated', 'five', 'into'],
    image: Location,
  };

  const mockFileService = {
    prepareImage: jest.fn((image) => image),
    uploadNewImageToAWSs3: jest.fn((verifiedImage, type) => ({
      verifiedImage,
      Location: verifiedImage === mockImageFile ? Location : undefined,
    })),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UserModule,
        ProfileModule,
        FileModule,
        TypeOrmModule.forFeature([UserEntity, PostEntity, FollowEntity]),
        TypeOrmModule.forRoot({
          ...testConfig,
          autoLoadEntities: true,
        }),
      ],
      controllers: [PostController],
      providers: [PostService, PostRepository],
    })
      .overrideProvider(FileService)
      .useValue(mockFileService)
      .compile();

    controller = module.get<PostController>(PostController);
    userService = module.get<UserService>(UserService);
    savedUser = await userService.registerNewUser(mockNewUser);
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
      await controller.createPost(
        savedUser as UserEntity,
        mockNewPost,
        mockImageFile as any,
      ),
    ).toEqual({
      ...mockNewPost,
      author: savedUser,
      createdAt: expect.any(Date),
      favoriteCount: 0,
      id: expect.any(Number),
    });
  });

  it('should throw HttpException 503', async () => {
    try {
      expect(
        await controller.createPost(
          savedUser as UserEntity,
          mockNewPost,
          mockBigImageFile as any,
        ),
      );
      throw new Error(INTEGRATION_TEST_ERR);
    } catch (e) {
      expect(e.message).toBe(`image size must be less than 3MB`);
    }
  });

  it('should update and return updated post', async () => {
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
    expect(await controller.findOnePostsById(1)).toEqual({
      ...mockPostToUpdate,
      createdAt: expect.any(Date),
      favoriteCount: 0,
      id: expect.any(Number),
    });
  });

  it('should throw error', async () => {
    try {
      expect(await controller.findOnePostsById(404));
      throw new Error(INTEGRATION_TEST_ERR);
    } catch (e) {
      expect(e.message).toBe("post doesn't exist");
    }
  });

  it('should like post', async () => {
    expect(await controller.likePost(1, '1')).toEqual({
      ...mockPostToUpdate,
      createdAt: expect.any(Date),
      favoriteCount: 1,
      id: expect.any(Number),
    });
  });

  it('should dislike post', async () => {
    expect(await controller.disLikePost(1, '1')).toMatchObject({
      ...mockPostToUpdate,
      createdAt: expect.any(Date),
      favoriteCount: 0,
      id: expect.any(Number),
    });
  });

  it('should throw error', async () => {
    try {
      expect(await controller.deletePost(1, '404'));
      throw new Error(INTEGRATION_TEST_ERR);
    } catch (e) {
      expect(e.message).toBe("can't find post");
    }
  });
});
