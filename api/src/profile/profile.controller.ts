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
import {
  findOneProfile,
  followProfile,
  unFollowProfile,
} from './consts/profile.swagger.consts';

@ApiTags('profile module')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApiOperation(findOneProfile.apiOperation)
  @ApiResponse(findOneProfile.apiResponse)
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

  @ApiOperation(followProfile.apiOperation)
  @ApiResponse(followProfile.apiResponse)
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

  @ApiOperation(unFollowProfile.apiOperation)
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
