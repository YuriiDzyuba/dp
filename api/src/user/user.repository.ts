import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserType } from './types/user.type';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  async findOneUserByEmailAndUserName(
    email: string,
    username: string,
  ): Promise<UserType> {
    return await this.users.findOne({
      where: [{ email }, { username }],
    });
  }

  async saveNewUser(userToSave: UserEntity): Promise<UserEntity> {
    return await this.users.save(userToSave);
  }

  async findOneUserWithPasswordByEmail(userEmail: string): Promise<UserEntity> {
    return await this.users.findOne(
      {
        email: userEmail,
      },
      {
        select: ['id', 'username', 'email', 'summary', 'avatar', 'password'],
      },
    );
  }

  async findUserById(id: number): Promise<UserEntity> {
    return await this.users.findOne(id);
  }

  async findOneUserByEmail(email: string): Promise<UserEntity> {
    return await this.users.findOne({ email });
  }

  async findManyUsersByUserName(usersName): Promise<UserEntity[]> {
    return await this.users.find({
      where: usersName,
    });
  }

  async getAllUsers(): Promise<UserEntity[]> {
    return await this.users.find();
  }

  async updateCurrentUser(currentUser, fieldsToUpdate): Promise<UserEntity> {
    return await this.users.save({
      ...currentUser,
      ...fieldsToUpdate,
    });
  }
}
