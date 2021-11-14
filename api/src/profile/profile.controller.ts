import {
  Controller,
  Get,
  Param,
  Delete,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { User } from '../user/decorators/user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ProfileType } from './types/profile.type';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('profile module')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApiOperation({ summary: 'find one user profile by user id (public route)' })
  @ApiResponse({
    status: 200,
    description: 'founded user profile',
  })
  @Get(':username')
  async findOneProfile(
    @User('id') currentUserId: number,
    @Param('username') profileUserName: string,
  ): Promise<ProfileType> {
    const profile = await this.profileService.findOneProfile(
      currentUserId,
      profileUserName,
    );
    return this.profileService.buildProfileResponse(profile);
  }

  @ApiOperation({ summary: 'subscribe to user profile' })
  @ApiResponse({
    status: 200,
  })
  @Post('follow/:username')
  @UseGuards(AuthGuard)
  async followProfile(
    @User('id') currentUserId: number,
    @Param('username') profileUserName: string,
  ): Promise<ProfileType> {
    const profile = await this.profileService.followProfile(
      currentUserId,
      profileUserName,
    );
    return this.profileService.buildProfileResponse(profile);
  }

  @ApiOperation({ summary: 'unsubscribe from user profile' })
  @Delete('follow/:username')
  @UseGuards(AuthGuard)
  async unFollowProfile(
    @User('id') currentUserId: number,
    @Param('username') profileUserName: string,
  ): Promise<ProfileType> {
    const profile = await this.profileService.unFollowProfile(
      currentUserId,
      profileUserName,
    );
    return this.profileService.buildProfileResponse(profile);
  }
}
