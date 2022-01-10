import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { createUniqueString } from '../utils/createUniqueString';
import { FileService } from '../file/file.service';

describe('UserService', () => {
  test('will receive process.env variables', () => {
    process.env.REFRESH_JWT_SECRET = 'test';
    process.env.ACCESS_JWT_SECRET = 'test2';
    process.env.REFRESH_TOKEN_EXP_IN = '2h';
    process.env.ACCESS_TOKEN_EXP_IN = '1h';
  });

  let service: UserService;

  const mockNewUser: CreateUserDto = {
    username: `user-${createUniqueString()}`,
    email: `${createUniqueString()}@mail.vgo`,
    password: 'qwerty',
  };

  const mockNewUserDbData = {
    createdAt: new Date(),
    id: 34323,
    avatar: '',
    summary: '',
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

  const mockWrongPasswordUser = {
    username: mockUser.username,
    email: mockUser.email,
    password: `${mockUser.password}r`,
  };

  const mockUserHashedPassword =
    '$2b$07$OQQPwgZlElJKI4u/h3WkUeCiiJ/tL1dLiGwwX7EcN2x6J2TyiAUqW';

  const mockAvatar = 'some binary file';

  const avatarLocation = `https://location/s3/`;

  const mockUserRepository = {
    findOneUserByEmailAndUserName: jest.fn((email, username) => {
      if (email === mockUser.email && username === mockUser.username) {
        return mockUser;
      } else return undefined;
    }),
    findOneUserWithPasswordByEmail: jest.fn((email) => {
      if (email === mockUser.email) {
        return { ...mockUser, password: mockUserHashedPassword };
      } else return undefined;
    }),
    saveNewUser: jest.fn((userToSave) => {
      delete userToSave.password;
      return {
        ...userToSave,
        ...mockNewUserDbData,
        summary: '',
        avatar: '',
      };
    }),
    findUserById: jest.fn((id) => (id === mockUser.id ? mockUser : undefined)),
    findOneUserByEmail: jest.fn((email) =>
      email === mockUser.email ? mockUser : undefined,
    ),
    findManyUsersByUserName: jest.fn((usernames) => {
      if (usernames[0] === mockUser.username) {
        return [mockUser];
      } else return [];
    }),
    updateCurrentUser: jest.fn((currentUser, updateUserDto) => {
      if (updateUserDto.username && updateUserDto.username === 'existingName') {
        throw new Error();
      } else
        return {
          ...currentUser,
          ...updateUserDto,
        };
    }),
  };

  const mockFileService = {
    prepareImage: jest.fn((avatar) => avatar),
    uploadNewImageToAWSs3: jest.fn((verifiedImage, type) => ({
      verifiedImage,
      Location: avatarLocation + type,
    })),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: FileService,
          useValue: mockFileService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return new saved user', async () => {
    expect(await service.registerNewUser(mockNewUser)).toEqual({
      ...mockNewUserDbData,
      email: mockNewUser.email,
      username: mockNewUser.username,
    });
  });

  it('should throw HttpException 422', async () => {
    try {
      expect(await service.registerNewUser(mockUser)).toEqual({
        ...mockNewUserDbData,
        email: mockNewUser.email,
        username: mockNewUser.username,
      });
    } catch (e) {
      expect(e.message).toBe('user exists');
    }
  });

  it('should return existing user', async () => {
    expect(
      await service.login({
        email: mockUser.email,
        password: mockUser.password,
      }),
    ).toEqual({
      username: 'Andrey',
      email: 'andrey44@mail.vgo',
      id: 1,
      summary: '',
      avatar: '',
      createdAt: mockUser.createdAt,
      posts: [],
      likedPosts: [],
      comments: [],
    });
  });

  it('should throw HttpException 400', async () => {
    try {
      expect(await service.login(mockNewUser)).toEqual({
        ...mockUser,
      });
    } catch (e) {
      expect(e.message).toBe(
        `user with email: ${mockNewUser.email} is not exist`,
      );
    }
  });

  it('should throw HttpException 403', async () => {
    try {
      expect(await service.login(mockWrongPasswordUser)).toEqual({
        ...mockUser,
      });
    } catch (e) {
      expect(e.message).toBe('wrong password');
    }
  });

  it('should find and return one user', async () => {
    expect(await service.findUserById(mockUser.id)).toEqual(mockUser);
  });

  it('should return undefined', async () => {
    expect(await service.findUserById(23)).toEqual(undefined);
  });

  it('should find and return user by email', async () => {
    expect(await service.findOneUserByEmail(mockUser.email)).toEqual(mockUser);
  });

  it('should return undefined', async () => {
    expect(await service.findOneUserByEmail('ar@mail.vgo')).toEqual(undefined);
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

  it('should return array of users', async () => {
    expect(await service.findUsersByNames([mockUser.username])).toEqual([
      mockUser,
    ]);
  });

  it('should return empty array ', async () => {
    expect(await service.findUsersByNames(['wrongName'])).toEqual([]);
  });

  it('should update and return updated user ', async () => {
    expect(
      await service.updateCurrentUser(
        mockUser,
        {
          summary: 'updated summary',
          username: 'Ivan',
        },
        mockAvatar,
      ),
    ).toEqual({
      ...mockUser,
      summary: 'updated summary',
      username: 'Ivan',
      avatar: avatarLocation + 'avatar',
    });
  });

  it('should throw HttpException 400', async () => {
    try {
      expect(
        await service.updateCurrentUser(
          mockUser,
          {
            summary: 'updated summary',
            username: 'existingName',
          },
          'some avatar',
        ),
      ).toEqual({
        ...mockUser,
        summary: 'updated summary',
        username: 'existingName',
        avatar: mockAvatar,
      });
    } catch (e) {
      expect(e.message).toBe('username should be unique');
    }
  });
});
