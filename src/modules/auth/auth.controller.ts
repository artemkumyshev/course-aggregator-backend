import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import {
  BadRequestResponse,
  ConflictResponse,
  CreatedResponse,
  ErrorResponses,
  OkResponse,
  Operation,
  UnauthorizedResponse,
} from 'src/shared/decorators';
import { GenericResponse } from 'src/shared/dto/generic-response.dto';

import { SignInAuthDto } from './dto/signin-auth.dto';
import { SignUpAuthDto } from './dto/signup-auth.dto';
import { UserEntity } from './entities/user.entity';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';

@ApiTags('Регистрация / Авторизация')
@ApiExtraModels(UserEntity)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Operation('Регистрация пользователя')
  @CreatedResponse(UserEntity)
  @ErrorResponses(ConflictResponse, BadRequestResponse)
  @Post('signup')
  async signUp(
    @Body() signUpAuthDto: SignUpAuthDto,
  ): Promise<GenericResponse<{ user: UserEntity }>> {
    const user = await this.authService.signUp(signUpAuthDto);
    return new GenericResponse('Вы успешно прошли регистрацию', { user });
  }

  @Operation('Вход в систему')
  @OkResponse(UserEntity)
  @ErrorResponses(UnauthorizedResponse, BadRequestResponse)
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signIn(
    @Body() signInAuthDto: SignInAuthDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<GenericResponse<{ user: UserEntity }>> {
    const user = await this.authService.signIn(signInAuthDto);

    const { accessToken, ...accessOption } =
      this.authService.getCookieWithJwtAccessToken(user.id);

    const { refreshToken, ...refreshOption } =
      this.authService.getCookieWithJwtRefreshToken(user.id);

    await this.userService.setCurrentRefreshToken(refreshToken, user.id);

    response.cookie('Authentication', accessToken, accessOption);
    response.cookie('Refresh', refreshToken, refreshOption);

    return new GenericResponse('Вы успешно авторизовались', {
      user,
    });
  }

  @Operation('Выход из системы')
  @OkResponse(UserEntity)
  @UseGuards(JwtRefreshGuard)
  @Post('signout')
  async signOut(
    @Req() request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const { accessOption, refreshOption } =
      this.authService.getCookiesForLogOut();

    await this.userService.removeRefreshToken(request.user.id);

    response.cookie('Authentication', '', accessOption);
    response.cookie('Refresh', '', refreshOption);
  }

  @Operation('Обновить токен')
  @OkResponse()
  @ApiCookieAuth()
  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  async refresh(
    @Req() request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = request.user;
    const { accessToken, ...accessOption } =
      this.authService.getCookieWithJwtAccessToken(user.id);
    response.cookie('Authentication', accessToken, accessOption);

    return new GenericResponse('Вы успешно авторизовались', {
      user,
    });
  }
}
