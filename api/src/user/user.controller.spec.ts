import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { FollowEntity } from '../profile/entities/follow.entity';
import { FileService } from '../file/file.service';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import testConfig from '../config/ormConfigTest';
import { getConnection } from 'typeorm';
import { createUniqueString } from '../utils/createUniqueString';
import { FileModule } from '../file/file.module';
import { UserController } from './user.controller';
import { PostEntity } from '../post/entities/post.entity';
import { UserRepository } from './user.repository';

describe('PostController', () => {
  test('will receive process.env variables', () => {
    process.env.REFRESH_JWT_SECRET = 'test';
    process.env.ACCESS_JWT_SECRET = 'test2';
    process.env.REFRESH_TOKEN_EXP_IN = '2h';
    process.env.ACCESS_TOKEN_EXP_IN = '1h';
  });

  let controller: UserController;

  const Location = 'https://first-mom/posts/rtert-xulpeq.jpeg';

  const mockImageFile = 'image.jpeg';

  const mockNewUser: CreateUserDto = {
    username: `user-${createUniqueString()}`,
    email: `${createUniqueString()}@mail.vgo`,
    password: 'qwerty',
  };

  const mockSavedUser = {
    username: mockNewUser.username,
    email: mockNewUser.email,
    id: 11,
    summary: '',
    avatar: '',
    createdAt: new Date(),
  };

  const mockUserToUpdate = {
    username: 'updatedName',
    email: 'updatedName@rt.rt',
    summary: 'updated summary',
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
        FileModule,
        TypeOrmModule.forFeature([UserEntity, PostEntity, FollowEntity]),
        TypeOrmModule.forRoot({
          ...testConfig,
          autoLoadEntities: true,
        }),
      ],
      controllers: [UserController],
      providers: [UserService, UserRepository],
    })
      .overrideProvider(FileService)
      .useValue(mockFileService)
      .compile();

    controller = module.get<UserController>(UserController);
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

  it('should save and return new user ', async () => {
    expect(await controller.registerNewUser(mockNewUser)).toEqual({
      ...mockSavedUser,
      createdAt: expect.any(Date),
      id: expect.any(Number),
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
  });

  it('should throw HttpException 422', async () => {
    try {
      expect(await controller.registerNewUser(mockNewUser)).toEqual({});
    } catch (e) {
      expect(e.message).toBe(`user exists`);
    }
  });

  it('should update and return updated user', async () => {
    expect(
      await controller.updateCurrentUser(
        mockSavedUser as UserEntity,
        mockUserToUpdate,
        mockImageFile as any,
      ),
    ).toEqual({
      ...mockSavedUser,
      ...mockUserToUpdate,
      createdAt: expect.any(Date),
      id: expect.any(Number),
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
  });

  it('should find user by id', async () => {
    expect(await controller.findUserById('1')).toMatchObject({
      email: expect.any(String),
      createdAt: expect.any(Date),
      id: expect.any(Number),
      avatar: expect.any(String),
    });
  });
});
