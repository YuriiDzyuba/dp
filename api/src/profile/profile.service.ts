import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ProfileType } from './types/profile.type';
import { FollowEntity } from './entities/follow.entity';
import { UserService } from '../user/user.service';
import { ProfileRepository } from './profile.repository';

@Injectable()
export class ProfileService {
  constructor(
    private readonly userService: UserService,
    private readonly profileRepository: ProfileRepository,
  ) {}

  async findOneProfile(
    currentUserId: number,
    profileUserName: string,
  ): Promise<ProfileType> {
    const user = await this.userService.findOneUserByNameWithPosts(
      profileUserName,
    );

    if (!user) {
      throw new HttpException('profile does not exist', HttpStatus.NOT_FOUND);
    }

    const followedProfile = await this.profileRepository.findOneFollowedProfile(
      currentUserId,
      user.id,
    );

    return { ...user, following: !!followedProfile };
  }

  async followProfile(
    currentUserId: number,
    profileUserName: string,
  ): Promise<ProfileType> {
    const user = await this.userService.findOneUserByName(profileUserName);

    if (!user) {
      throw new HttpException('profile does not exist', HttpStatus.NOT_FOUND);
    }

    if (user.id === currentUserId) {
      throw new HttpException(
        "follower and following can't be equal",
        HttpStatus.BAD_REQUEST,
      );
    }

    const follow = await this.profileRepository.findOneFollowedProfile(
      currentUserId,
      user.id,
    );

    if (!follow) {
      const followToCreate = new FollowEntity();
      followToCreate.followerId = currentUserId;
      followToCreate.followingId = user.id;
      await this.profileRepository.followProfile(followToCreate);
    }

    return { ...user, following: true };
  }

  async unFollowProfile(
    currentUserId: number,
    profileUserName: string,
  ): Promise<ProfileType> {
    const user = await this.userService.findOneUserByName(profileUserName);

    if (!user) {
      throw new HttpException('profile does not exist', HttpStatus.NOT_FOUND);
    }

    if (user.id === currentUserId) {
      throw new HttpException(
        'you cant unfollow your own profile',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.profileRepository.unFollowProfile(currentUserId, user.id);
    return { ...user, following: false };
  }

  buildProfileResponse(profile: ProfileType): ProfileType {
    delete profile.email;
    return profile;
  }

  async findFollowingUsers(userId: number): Promise<FollowEntity[]> {
    return await this.profileRepository.findFollowingUsers(userId);
  }
}
