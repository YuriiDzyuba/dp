import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { PostEntity } from './entities/post.entity';
import { UserEntity } from '../user/entities/user.entity';
import { FollowEntity } from '../profile/entities/follow.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';

describe('PostService', () => {
  let service: PostService;

  const mockNewPost: CreatePostDto = {
    title: 'It was popul 1960s ',
    description: 'survived not ce',
    body: 'survived not only five ce, remaining etraset shesages, with',
    tagList: ['release', 'five', 'into'],
    imageFilter: 'multi',
    image: '',
  };

  const mockFoundedPost = {
    title: 'It was popul 1960s ',
    description: 'survived not ce',
    body: 'survived not only five ce, remaining etraset shesages, with',
    tagList: ['release', 'five', 'into'],
    imageFilter: 'multi',
    image: '',
    author: 1,
  };

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

  const mockPostRepository = {
    save: jest
      .fn()
      .mockImplementation((createPostDto: PostEntity) =>
        Promise.resolve({ id: Date.now(), ...createPostDto }),
      ),
    findOne: jest
      .fn()
      .mockImplementation((postToDeleteId) => Promise.resolve(mockFoundedPost)),
    delete: jest
      .fn()
      .mockImplementation(({ id: postToDeleteId }) => ({ affected: 1 })),
  };

  const mockUserRepository = {
    find: jest.fn().mockImplementation((dto) => dto),
    findOne: jest.fn().mockImplementation((currentUserId) => ({
      ...mockUser,
      likedPosts: [],
    })),
    save: jest.fn().mockImplementation((dto) => Promise.resolve()),
  };

  const mockFollowRepository3 = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: getRepositoryToken(PostEntity),
          useValue: mockPostRepository,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(FollowEntity),
          useValue: mockFollowRepository3,
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create and return new post', async () => {
    expect(await service.createPost(mockUser, mockNewPost)).toMatchObject({
      id: expect.any(Number),
      ...mockNewPost,
    });
  });

  it('should find and return post', async () => {
    expect(await service.findPostById(mockUser.id)).toMatchObject(
      mockFoundedPost,
    );
  });

  it('should add return chosen post to favorites', async () => {
    expect(await service.likePost(mockUser.id, '1')).toMatchObject(
      mockFoundedPost,
    );
  });

  it('should subtract from favorites and return post', async () => {
    expect(await service.disLikePost(mockUser.id, '1')).toMatchObject(
      mockNewPost,
    );
  });
});
