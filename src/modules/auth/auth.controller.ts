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
import { Response, Request } from 'express';

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
import { Auth } from './decorator/auth.decorator';
import { GetUser } from './decorator/get-user.decorator';

import { SignInAuthDto } from './dto/signin-auth.dto';
import { SignUpAuthDto } from './dto/signup-auth.dto';
import { UserEntity } from './entities/user.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
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
  @UseGuards(JwtAuthGuard)
  @Post('signout')
  async signOut(
    @Res({ passthrough: true }) response: Response,
    @GetUser() { id }: Pick<UserEntity, 'id'>,
  ): Promise<GenericResponse<string>> {
    await this.authService.signOut(id);
    response.clearCookie('Authentication');
    response.clearCookie('Refresh');
    return new GenericResponse('Успешный выход из системы');
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

  @Operation('Получить профиль текущего пользователя')
  @OkResponse(UserEntity)
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(
    @GetUser() { id }: Pick<UserEntity, 'id'>,
  ): Promise<GenericResponse<UserEntity>> {
    const user = await this.authService.getProfile(id);
    return new GenericResponse('Профиль успешно найден', user);
  }
}
