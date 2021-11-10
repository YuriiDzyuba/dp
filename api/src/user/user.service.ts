import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { HASH_SALT, JWT_SECRET, TOKEN_EXP_IN } from 'src/config';
import { UserResponseInterface } from './types/userResponse.interface';
import { hash, compare } from 'bcrypt';
import { UserType } from './types/user.type';
import { LoginUserDto } from './dto/loginUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(candidate: CreateUserDto): Promise<UserType> {
    const userByEmail = await this.userRepository.findOne({
      email: candidate.email,
    });

    const userByUsername = await this.userRepository.findOne({
      username: candidate.username,
    });

    if (userByEmail || userByUsername) {
      throw new HttpException(
        { message: 'user exists' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const hashedPassword = await hash(candidate.password, HASH_SALT);

    const userToSave = new UserEntity();
    Object.assign(userToSave, candidate);
    userToSave.password = hashedPassword;

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

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
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

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  generateToken(user: UserType): string {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXP_IN },
    );
  }

  buildUserResponse(user: UserType): UserResponseInterface {
    return {
      ...user,
      token: this.generateToken(user),
    };
  }
}
