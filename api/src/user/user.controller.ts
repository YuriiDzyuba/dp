import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseInterface } from './types/userResponse.interface';
import { AuthGuard } from '../auth/guards/auth.guard';
import { User } from './decorators/user.decorator';
import { UserEntity } from './entities/user.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('user module')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  //@UseGuards(AuthGuard)
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findUserById(+id);
  }

  @Post('registration')
  @UsePipes(new ValidationPipe())
  async registerNewUser(
    @Body() candidate: CreateUserDto,
  ): Promise<UserResponseInterface> {
    const newUser = await this.userService.registerNewUser(candidate);
    return this.userService.buildUserResponse(newUser);
  }

  @Patch()
  @UseGuards(AuthGuard)
  async updateCurrentUser(
    @User() currentUser: UserEntity,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseInterface> {
    const updatedUser = await this.userService.updateCurrentUser(
      currentUser,
      updateUserDto,
    );
    return this.userService.buildUserResponse(updatedUser);
  }
}
