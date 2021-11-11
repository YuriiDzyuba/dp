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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { UserResponseInterface } from '../user/types/userResponse.interface';
import { LoginUserDto } from '../user/dto/loginUser.dto';
import { RefreshTokensGuard } from './guards/refreshTokens.guard';
import { ExpressRequestInterface } from '../types/expressRequest.interface';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  @UsePipes(new ValidationPipe())
  async loginUser(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.login(loginUserDto);
    return this.userService.buildUserResponse(user);
  }

  @Get('refresh_token')
  @UseGuards(RefreshTokensGuard)
  genNewTokenPair(@Req() request: ExpressRequestInterface) {
    return this.userService.buildUserResponse(request.userToRefreshTokens);
  }

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

  @Get('google')
  @Redirect('https://accounts.google.com/', 302)
  getGoogleAuthURL() {
    const redirectLink = this.authService.getLinkToGoogleAccount();
    return { url: redirectLink };
  }
}
