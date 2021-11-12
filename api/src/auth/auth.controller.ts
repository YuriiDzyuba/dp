import {
  Controller,
  Get,
  Redirect,
  Query,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { UserResponseInterface } from '../user/types/userResponse.interface';
import { LoginUserDto } from '../user/dto/loginUser.dto';
import { RefreshTokensGuard } from './guards/refreshTokens.guard';
import { ExpressRequestInterface } from '../types/expressRequest.interface';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserEntity } from '../user/entities/user.entity';

@ApiTags('auth module')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({ summary: 'login user by email and password' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'user with access and refresh tokens',
    type: UserEntity,
  })
  @Post('login')
  @UsePipes(new ValidationPipe())
  async loginUser(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.login(loginUserDto);
    return this.userService.buildUserResponse(user);
  }

  @ApiOperation({ summary: 'get new tokens' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'refresh access and refresh tokens',
  })
  @Get('refresh_token')
  @UseGuards(RefreshTokensGuard)
  genNewTokenPair(@Req() request: ExpressRequestInterface) {
    return this.userService.buildUserResponse(request.userToRefreshTokens);
  }

  @ApiOperation({ summary: 'redirect here users from GCP' })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'registered new or authorized user with access and refresh tokens',
  })
  @Get('google_redirect')
  async googleAuthRedirect(
    @Query('code')
    code: string,
  ) {
    const googleUser = await this.authService.getGoogleUser(code);

    const foundedUser = await this.userService.findOneUserByEmail(
      googleUser.email,
    );

    if (!foundedUser) {
      const newApplicant = this.authService.normalizeGoogleUser(googleUser);

      const newUser = await this.userService.registerNewUser(newApplicant);

      return this.userService.buildUserResponse(newUser);
    }

    return this.userService.buildUserResponse(foundedUser);
  }

  @ApiOperation({ summary: 'redirect from here to GCP' })
  @ApiResponse({
    status: HttpStatus.MOVED_PERMANENTLY,
    description:
      'after login in google account user will be redirected to auth/google_redirect',
  })
  @Get('google')
  @Redirect('https://accounts.google.com/', 302)
  getGoogleAuthURL() {
    const redirectLink = this.authService.getLinkToGoogleAccount();
    return { url: redirectLink };
  }
}
