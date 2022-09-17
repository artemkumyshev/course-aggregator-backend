import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import express from 'express';

import { AuthService } from './auth.service';
import { IRegistrationStatus } from './interface/registration-status.interface';

import { UserService } from './../user/user.service';
import { CreateUserDto } from './../user/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginUserDto } from '../user/dto/login-user.dto';

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({
    summary: 'Регистрация нового пользователя',
  })
  @Post('signup')
  public async signup(
    @Body() createUserDto: CreateUserDto,
  ): Promise<IRegistrationStatus> {
    const result = await this.authService.signup(createUserDto);

    if (!result.success) {
      throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    }

    return result;
  }

  @HttpCode(200)
  @Post('signin')
  public async signin(@Body() loginUserDto: LoginUserDto) {
    const { refreshToken, user, accessToken } = await this.authService.login(
      loginUserDto,
    );

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  @HttpCode(200)
  @Post('logout')
  async logout(@Body('email') email: string) {
    return await this.authService.logout(email);
  }

  @Post('refresh-token')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
  T;
}
