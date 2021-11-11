import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import {
  ACCESS_JWT_SECRET,
  ACCESS_TOKEN_EXP_IN,
  HASH_SALT,
  REFRESH_JWT_SECRET,
  REFRESH_TOKEN_EXP_IN,
} from 'src/config';
import { hash, compare } from 'bcrypt';
import { UserType } from './types/user.type';
import { LoginUserDto } from './dto/loginUser.dto';
import { UserResponseInterface } from './types/userResponse.interface';
import { sign } from 'jsonwebtoken';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async registerNewUser(candidate: CreateUserDto): Promise<UserType> {
    console.log(candidate, 'candidate');

    const existingUser = await this.userRepository.findOne({
      where: [{ email: candidate.email }, { username: candidate.username }],
    });

    if (existingUser) {
      throw new HttpException(
        { message: 'user exists' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const hashedPassword = await hash(candidate.password, HASH_SALT);

    const userToSave = new UserEntity();
    Object.assign(userToSave, candidate);
    userToSave.password = hashedPassword;
    userToSave.username = candidate.username;

    const newUser = await this.userRepository.save(userToSave);

    delete newUser.password;
    return newUser;
  }

  async login(loginUserDto: LoginUserDto): Promise<UserType> {
    const userByEmail = await this.userRepository.findOne(
      {
        email: loginUserDto.email,
      },
      {
        select: ['id', 'username', 'email', 'summary', 'avatar', 'password'],
      },
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
    return await this.userRepository.findOne(id);
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOneUserByEmail(email: string): Promise<UserType> {
    return await this.userRepository.findOne({ email });
  }

  async updateCurrentUser(
    currentUser: UserEntity,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const updatedUser = await this.userRepository.save({
      ...currentUser,
      ...updateUserDto,
    });
    return updatedUser;
  }

  generateToken(user: UserType, tokenType = 'access'): string {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      tokenType === 'refresh' ? REFRESH_JWT_SECRET : ACCESS_JWT_SECRET,
      {
        expiresIn:
          tokenType === 'refresh' ? REFRESH_TOKEN_EXP_IN : ACCESS_TOKEN_EXP_IN,
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
