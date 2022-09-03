import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { AuthService } from './auth.service';

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signin')
  async signin(@Body() userDto: CreateUserDto) {
    return await this.authService.signin(userDto);
  }

  @Post('/signup')
  async signup(@Body() userDto: CreateUserDto) {
    return await this.authService.signup(userDto);
  }
}
