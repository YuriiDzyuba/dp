import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UsePipes,
  ValidationPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseInterface } from './types/userResponse.interface';
import { AuthGuard } from '../auth/guards/auth.guard';
import { User } from './decorators/user.decorator';
import { UserEntity } from './entities/user.entity';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  findUserById,
  registerNewUser,
  updateCurrentUser,
} from './consts/user.swagger.consts';

@ApiTags('user module')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation(findUserById.apiOperation)
  @ApiResponse(findUserById.apiResponse)
  @Get(':id')
  findUserById(@Param('id') id: string) {
    return this.userService.findUserById(+id);
  }

  @ApiOperation(registerNewUser.apiOperation)
  @ApiResponse(registerNewUser.apiResponse)
  @Post('registration')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async registerNewUser(
    @Body() candidate: CreateUserDto,
  ): Promise<UserResponseInterface> {
    const newUser = await this.userService.registerNewUser(candidate);
    return this.userService.buildUserResponse(newUser);
  }

  @ApiOperation(updateCurrentUser.apiOperation)
  @ApiResponse(updateCurrentUser.apiResponse)
  @Patch()
  @UseInterceptors(FileInterceptor('avatar'))
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @UseGuards(AuthGuard)
  async updateCurrentUser(
    @User() currentUser: UserEntity,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() avatar: Express.Multer.File,
  ): Promise<UserResponseInterface> {
    const updatedUser = await this.userService.updateCurrentUser(
      currentUser,
      updateUserDto,
      avatar,
    );
    return this.userService.buildUserResponse(updatedUser);
  }
}
