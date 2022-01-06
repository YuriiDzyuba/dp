import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';

describe('UserService', () => {
  test('will receive process.env variables', () => {
    process.env.REFRESH_JWT_SECRET = 'test';
    process.env.ACCESS_JWT_SECRET = 'test2';
    process.env.REFRESH_TOKEN_EXP_IN = '2h';
    process.env.ACCESS_TOKEN_EXP_IN = '1h';
  });

  let service: UserService;

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

  const mockUserRepository = {
    find: jest.fn((dto) => dto),
    findOne: jest.fn((param) => {
      if (typeof param === 'number' && param === mockUser.id) {
        return {
          ...mockUser,
          likedPosts: [],
        };
      }
      if (typeof param === 'object') {
        if (param.email === mockUser.email)
          return {
            ...mockUser,
            likedPosts: [],
          };
      }
      return null;
    }),
    save: jest.fn(() => Promise.resolve()),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find and return one user', async () => {
    expect(await service.findUserById(mockUser.id)).toEqual(mockUser);
  });

  it('should return null', async () => {
    expect(await service.findUserById(23)).toEqual(null);
  });

  it('should find and return user by email', async () => {
    expect(await service.findOneUserByEmail(mockUser.email)).toEqual(mockUser);
  });

  it('should return null', async () => {
    expect(await service.findOneUserByEmail('ar@mail.vgo')).toEqual(null);
  });

  it('should build and return user with access and refresh tokens', async () => {
    expect(await service.buildUserResponse(mockUser)).toEqual({
      ...mockUser,
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
  });

  it('should create and return new user', async () => {
    expect(await service.buildUserResponse(mockUser)).toEqual({
      ...mockUser,
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
  });
});
