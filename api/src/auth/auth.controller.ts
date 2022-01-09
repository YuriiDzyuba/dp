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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  genNewTokenPair,
  getGoogleAuthURL,
  googleAuthRedirect,
  loginUser,
} from './consts/swagger.consts';

@ApiTags('auth module')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation(loginUser.apiOperation)
  @ApiResponse(loginUser.apiResponse)
  @Post('login')
  @UsePipes(new ValidationPipe())
  async loginUser(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.login(loginUserDto);
    return this.userService.buildUserResponse(user);
  }

  @ApiOperation(genNewTokenPair.apiOperation)
  @ApiResponse(genNewTokenPair.apiResponse)
  @Get('refresh_token')
  @UseGuards(RefreshTokensGuard)
  genNewTokenPair(@Req() request: ExpressRequestInterface) {
    return this.userService.buildUserResponse(request.userToRefreshTokens);
  }

  @ApiOperation(googleAuthRedirect.apiOperation)
  @ApiResponse(googleAuthRedirect.apiResponse)
  @Get('google_redirect')
  async googleAuthRedirect(
    @Query('code')
    code: string,
  ) {
    const checkedUser = await this.authService.checkGoogleUser(code);
    return this.userService.buildUserResponse(checkedUser);
  }

  @ApiOperation(getGoogleAuthURL.apiOperation)
  @ApiResponse(getGoogleAuthURL.apiResponse)
  @Get('google')
  @Redirect('https://accounts.google.com/', 302)
  getGoogleAuthURL() {
    const redirectLink = this.authService.getLinkToGoogleAccount();
    return { url: redirectLink };
  }
}
