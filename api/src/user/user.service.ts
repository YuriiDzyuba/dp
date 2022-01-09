import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { compare, hash } from 'bcrypt';
import { UserType } from './types/user.type';
import { LoginUserDto } from './dto/loginUser.dto';
import { UserResponseInterface } from './types/userResponse.interface';
import { sign } from 'jsonwebtoken';
import { UserRepository } from './user.repository';
import { FileService } from '../file/file.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly fileService: FileService,
  ) {}

  async registerNewUser(candidate: CreateUserDto): Promise<UserType> {
    const existingUser =
      await this.userRepository.findOneUserByEmailAndUserName(
        candidate.email,
        candidate.username,
      );

    if (existingUser) {
      throw new HttpException(
        { message: 'user exists' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const hashedPassword = await hash(
      candidate.password,
      Number(process.env.HASH_SALT),
    );

    const userToSave = new UserEntity();
    Object.assign(userToSave, candidate);
    userToSave.password = hashedPassword;
    userToSave.username = candidate.username;

    return await this.userRepository.saveNewUser(userToSave);
  }

  async login(loginUserDto: LoginUserDto): Promise<UserType> {
    const userByEmail =
      await this.userRepository.findOneUserWithPasswordByEmail(
        loginUserDto.email,
      );

    if (!userByEmail) {
      throw new HttpException(
        {
          message: `user with email: ${loginUserDto.email} is not exist`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const isPasswordCorrect = await compare(
      loginUserDto.password,
      userByEmail.password,
    );

    if (!isPasswordCorrect) {
      throw new HttpException(
        { message: 'wrong password' },
        HttpStatus.FORBIDDEN,
      );
    }

    delete userByEmail.password;
    return userByEmail;
  }

  async findUserById(id: number): Promise<UserEntity> {
    return await this.userRepository.findUserById(id);
  }

  async findUsersByNames(usersNames: string[]): Promise<UserEntity[]> {
    return await this.userRepository.findManyUsersByUserName(usersNames);
  }

  async findOneUserByEmail(email: string): Promise<UserType> {
    return await this.userRepository.findOneUserByEmail(email);
  }

  async findOneUserByName(username: string): Promise<UserType> {
    return await this.userRepository.findOneUserByName(username);
  }

  async findOneUserByNameWithPosts(username: string): Promise<UserType> {
    return await this.userRepository.findOneUserByNameWithPosts(username);
  }

  async updateCurrentUser(
    currentUser: UserEntity,
    updateUserDto: UpdateUserDto,
    avatar,
  ): Promise<UserEntity> {
    try {
      if (avatar) {
        const verifiedImage = await this.fileService.prepareImage(avatar);

        const { Location } = await this.fileService.uploadNewImageToAWSs3(
          verifiedImage,
          'avatar',
        );

        if (!Location) {
          throw new HttpException(
            'image size must be less than 3MB',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }

        updateUserDto.avatar = Location;
      }
      return await this.userRepository.updateCurrentUser(
        currentUser,
        updateUserDto,
      );
    } catch (err) {
      throw new HttpException(
        { message: `username should be unique` },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateUser(
    currentUser: UserEntity,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    try {
      return await this.userRepository.updateCurrentUser(
        currentUser,
        updateUserDto,
      );
    } catch (err) {
      throw new HttpException(
        { message: `username should be unique` },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  generateToken(user: UserType, tokenType = 'access'): string {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      tokenType === 'refresh'
        ? process.env.REFRESH_JWT_SECRET
        : process.env.ACCESS_JWT_SECRET,
      {
        expiresIn:
          tokenType === 'refresh'
            ? process.env.REFRESH_TOKEN_EXP_IN
            : process.env.ACCESS_TOKEN_EXP_IN,
      },
    );
  }

  buildUserResponse(user: UserType): UserResponseInterface {
    return {
      ...user,
      accessToken: this.generateToken(user),
      refreshToken: this.generateToken(user, 'refresh'),
    };
  }
}
