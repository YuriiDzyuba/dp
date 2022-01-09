import { Injectable } from '@nestjs/common';
import { ProfileType } from './types/profile.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowEntity } from './entities/follow.entity';

@Injectable()
export class ProfileRepository {
  constructor(
    @InjectRepository(FollowEntity)
    private readonly follow: Repository<FollowEntity>,
  ) {}

  async findOneFollowedProfile(
    followerId: number,
    followingId: number,
  ): Promise<FollowEntity | undefined> {
    return await this.follow.findOne({ followerId, followingId });
  }

  async followProfile(profileToFollow: FollowEntity): Promise<FollowEntity> {
    return await this.follow.save(profileToFollow);
  }

  async unFollowProfile(
    followerId: number,
    followingId: number,
  ): Promise<void> {
    await this.follow.delete({ followerId, followingId });
  }

  buildProfileResponse(profile: ProfileType): ProfileType {
    delete profile.email;
    return profile;
  }

  async findFollowingUsers(followerId: number): Promise<FollowEntity[]> {
    return await this.follow.find({
      followerId: followerId,
    });
  }
}
