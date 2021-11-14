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
  HttpException,
  HttpStatus,
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
import { FileService } from '../file/file.service';

@ApiTags('user module')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly fileService: FileService,
  ) {}

  @Get()
  //@UseGuards(AuthGuard)
  findAllUsersByQuery() {
    return this.userService.findAllUsersByQuery();
  }

  @ApiOperation({ summary: 'find one user by id' })
  @ApiResponse({
    status: 200,
    description: 'founded user',
    type: UserEntity,
  })
  @Get(':id')
  findUserById(@Param('id') id: string) {
    return this.userService.findUserById(+id);
  }

  @ApiOperation({ summary: 'create new user by email and password' })
  @ApiResponse({
    status: 201,
    description: 'created new user',
    type: UserEntity,
  })
  @Post('registration')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async registerNewUser(
    @Body() candidate: CreateUserDto,
  ): Promise<UserResponseInterface> {
    const newUser = await this.userService.registerNewUser(candidate);
    return this.userService.buildUserResponse(newUser);
  }

  @ApiOperation({ summary: 'update current user ' })
  @ApiResponse({
    status: 200,
    description: 'updated user',
    type: UserEntity,
  })
  @Patch()
  @UseInterceptors(FileInterceptor('avatar'))
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @UseGuards(AuthGuard)
  async updateCurrentUser(
    @User() currentUser: UserEntity,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() avatar: Express.Multer.File,
  ): Promise<UserResponseInterface> {
    if (avatar) {
      const verifiedImage = await this.fileService.prepareImage(avatar);

      const { Location } = await this.fileService.uploadNewImageToAWSs3(
        verifiedImage,
        'avatar',
      );

      if (!Location) {
        throw new HttpException(
          'image size must be less than 3MB',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      updateUserDto.avatar = Location;
    }

    const updatedUser = await this.userService.updateCurrentUser(
      currentUser,
      updateUserDto,
    );
    return this.userService.buildUserResponse(updatedUser);
  }
}
