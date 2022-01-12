import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { UserEntity } from '../user/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { PostRepository } from './post.repository';
import { FileService } from '../file/file.service';
import { UserService } from '../user/user.service';
import { ProfileService } from '../profile/profile.service';
import { UpdatePostDto } from './dto/update-post.dto';
import { UNIT_TEST_ERR } from '../consts/test.consts';

describe('PostService', () => {
  let service: PostService;

  const mockAuthor = {
    username: 'Andrey',
    email: 'andrey44@mail.vgo',
    id: 1,
    summary: '',
    avatar: '',
    createdAt: new Date(),
  };

  const mockUser: UserEntity = {
    ...mockAuthor,
    password: 'qwerty',
    posts: [],
    likedPosts: [],
    comments: [],
  };

  const mockNewPost: CreatePostDto = {
    title: 'It was popul 1960s ',
    description: 'survived not ce',
    body: 'survived not only five ce, remaining etraset shesages, with',
    tagList: ['release', 'five', 'into'],
    imageFilter: 'multi',
    image: '',
  };

  const mockUpdatedPost: UpdatePostDto = {
    title: 'updated title ',
    description: 'updated description',
    body: 'updated body ',
    tagList: ['up', 'da', 'ted'],
    imageFilter: 'updated image',
    image: 'updated',
  };

  const mockImage = 'some binary file';

  const mockBigImage = 'some big binary file';

  const mockFoundedPost = {
    ...mockNewPost,
    image: mockImage,
    author: 1,
    id: 1,
    favoriteCount: 0,
    createdAt: new Date(),
  };

  const postLocation = `https://location/s3/`;

  const postImgCategory = `posts`;

  const mockPostRepository = {
    savePost: jest.fn((post) => ({
      ...mockFoundedPost,
      ...post,
      author: mockAuthor,
    })),
    getOnePostToUpdate: jest.fn((currentUserId, postToUpdateId) => {
      if (
        currentUserId === mockUser.id &&
        postToUpdateId === mockFoundedPost.id
      ) {
        return { ...mockFoundedPost };
      } else return undefined;
    }),
    findManyPostsByTag: jest.fn((tag) => {
      if (mockFoundedPost.tagList[0] === tag) {
        return [mockFoundedPost];
      } else return [];
    }),
    findOnePostWithAuthorId: jest.fn((postId) =>
      postId === mockFoundedPost.id ? mockFoundedPost : undefined,
    ),
    deleteOnePost: jest.fn((postToDeleteId) =>
      postToDeleteId === mockFoundedPost.id ? 1 : null,
    ),
    findOnePost: jest.fn((postId) =>
      postId === mockFoundedPost.id ? mockFoundedPost : undefined,
    ),
  };

  const mockUserService = {
    findOneUserWithLikedPosts: jest.fn((currentUserId) =>
      currentUserId === mockUser.id ? mockUser : undefined,
    ),
    saveUser: jest.fn((mockUser) => mockUser),
  };

  const mockProfileService = {
    findFollowingUsers: jest.fn((pageOwnerUserId) =>
      pageOwnerUserId !== mockUser.id ? [mockUser] : [],
    ),
    getNewsPage: jest.fn((query, followingUserIds) => [mockFoundedPost]),
  };

  const mockFileService = {
    prepareImage: jest.fn((image) => image),
    uploadNewImageToAWSs3: jest.fn((verifiedImage, type) => ({
      verifiedImage,
      Location: verifiedImage === mockImage ? postLocation + type : undefined,
    })),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: PostRepository,
          useValue: mockPostRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: ProfileService,
          useValue: mockProfileService,
        },
        {
          provide: FileService,
          useValue: mockFileService,
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create and return new post', async () => {
    expect(
      await service.createPost(mockUser, {
        ...mockNewPost,
        image: postLocation + postImgCategory,
      }),
    ).toEqual({
      ...mockFoundedPost,
      image: postLocation + postImgCategory,
      author: mockAuthor,
    });
  });

  it('should throw HttpException 503', async () => {
    try {
      expect(await service.creteNewPost(mockUser, mockNewPost, mockBigImage));
      throw new Error(UNIT_TEST_ERR);
    } catch (e) {
      expect(e.message).toBe(`image size must be less than 3MB`);
    }
  });

  it('should create and return new post', async () => {
    expect(
      await service.creteNewPost(mockUser, mockNewPost, mockImage),
    ).toEqual({
      ...mockFoundedPost,
      image: postLocation + postImgCategory,
      author: mockAuthor,
    });
  });

  it('should return edited post', async () => {
    expect(
      await service.editPost(
        mockFoundedPost.id,
        mockUser.id,
        mockUpdatedPost,
        mockImage,
      ),
    ).toEqual({
      ...mockFoundedPost,
      ...mockUpdatedPost,
      image: postLocation + postImgCategory,
      author: mockAuthor,
    });
  });

  it('should throw HttpException 503', async () => {
    try {
      expect(
        await service.editPost(
          mockFoundedPost.id,
          mockUser.id,
          mockUpdatedPost,
          mockBigImage,
        ),
      );
      throw new Error(UNIT_TEST_ERR);
    } catch (e) {
      expect(e.message).toBe(`image size must be less than 3MB`);
    }
  });

  it('should throw HttpException 400', async () => {
    try {
      expect(
        await service.editPostById(2, mockUpdatedPost, mockFoundedPost.id),
      );
      throw new Error(UNIT_TEST_ERR);
    } catch (e) {
      expect(e.message).toBe(`can't find post`);
    }
  });

  it('should throw HttpException 400', async () => {
    try {
      expect(await service.editPostById(mockUser.id, mockUpdatedPost, 2));
      throw new Error(UNIT_TEST_ERR);
    } catch (e) {
      expect(e.message).toBe(`can't find post`);
    }
  });

  it('should update existing post', async () => {
    expect(
      await service.editPostById(
        mockUser.id,
        mockUpdatedPost,
        mockFoundedPost.id,
      ),
    ).toEqual({
      ...mockFoundedPost,
      ...mockUpdatedPost,
      author: mockAuthor,
    });
  });

  it('should return empty array', async () => {
    expect(await service.getUserNewsPage(mockUser.id, 'red')).toEqual([]);
  });

  it('should return posts by tag', async () => {
    expect(
      await service.findManyPostsByTag(mockFoundedPost.tagList[0]),
    ).toEqual([mockFoundedPost]);
  });

  it('should return empty array', async () => {
    expect(await service.findManyPostsByTag('tag')).toEqual([]);
  });

  it('should throw HttpException 400', async () => {
    try {
      expect(await service.deletePost(mockUser.id, '2'));
      throw new Error(UNIT_TEST_ERR);
    } catch (e) {
      expect(e.message).toBe(`can't find post`);
    }
  });

  it('should throw HttpException 403', async () => {
    try {
      expect(await service.deletePost(2, mockFoundedPost.id.toString()));
      throw new Error(UNIT_TEST_ERR);
    } catch (e) {
      expect(e.message).toBe(`access denied`);
    }
  });

  it('should deleteOnePost post by id', async () => {
    expect(
      await service.deletePost(mockUser.id, mockFoundedPost.id.toString()),
    ).toBe(1);
  });

  it('should throw HttpException 404', async () => {
    try {
      expect(await service.likePost(mockUser.id, '2'));
      throw new Error(UNIT_TEST_ERR);
    } catch (e) {
      expect(e.message).toBe(`post doesn't exist`);
    }
  });

  it('should throw HttpException 400', async () => {
    try {
      expect(await service.likePost(2, mockFoundedPost.id.toString()));
      throw new Error(UNIT_TEST_ERR);
    } catch (e) {
      expect(e.message).toBe(`wrong user id`);
    }
  });

  it('should like and return liked post ', async () => {
    expect(
      await service.likePost(mockUser.id, mockFoundedPost.id.toString()),
    ).toEqual(mockFoundedPost);
  });

  it('should throw HttpException 404', async () => {
    try {
      expect(await service.disLikePost(mockUser.id, '2'));
      throw new Error(UNIT_TEST_ERR);
    } catch (e) {
      expect(e.message).toBe(`post doesn't exist`);
    }
  });

  it('should throw HttpException 400', async () => {
    try {
      expect(await service.disLikePost(2, mockFoundedPost.id.toString()));
      throw new Error(UNIT_TEST_ERR);
    } catch (e) {
      expect(e.message).toBe(`wrong user id`);
    }
  });

  it('should dislike and return disliked post ', async () => {
    expect(
      await service.likePost(mockUser.id, mockFoundedPost.id.toString()),
    ).toEqual(mockFoundedPost);
  });
});
