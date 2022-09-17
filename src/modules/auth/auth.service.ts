import { LoginUserDto } from './../user/dto/login-user.dto';
import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { AuthEntity } from './entities/auth.entity';
import { TokenEntity } from './entities/token.entity';
import { IRegistrationStatus } from './interface/registration-status.interface';

import { IPayloadEmail, UserService } from '../user/user.service';
import { IUserResponse } from '../user/types/userResponse.interface';
import { CreateUserDto } from '../user/dto/create-user.dto';

export interface IResponseUserWithToken extends IUserResponse {
  refreshToken: string;
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(TokenEntity)
    private readonly tokenRepository: Repository<TokenEntity>,
    @InjectRepository(AuthEntity)
    private readonly authRepository: Repository<AuthEntity>,
    private userService: UserService,
    private jwtService: JwtService,
    private readonly mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async getAuthenticatedUser(
    email: string,
    plainTextPassword: string,
  ): Promise<IUserResponse> {
    try {
      const user = await this.userService.findByEmail(email);
      await this.verifyPassword(plainTextPassword, user.password);

      if (user.isLocked) {
        throw new HttpException(
          'Пользователь заблокирован',
          HttpStatus.BAD_REQUEST,
        );
      }

      return this.userService.buildUserResponse(user);
    } catch (e) {
      throw new HttpException(
        `Неверные учетные данные`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async signup(createUserDto: CreateUserDto): Promise<IRegistrationStatus> {
    const status = {
      success: true,
      message: 'Пользователь зарегистрирован.',
      user: null,
    };

    try {
      const newUser = await this.userService.create(createUserDto);
      status.user = this.userService.buildUserResponse(newUser).user;
    } catch (e) {
      status.success = false;
      status.message = e.message;
      status.user = null;
    }

    return status;
  }

  async validateUser(payload: IPayloadEmail): Promise<IUserResponse> {
    const user = await this.userService.findByEmail(payload.email);

    if (!user) {
      throw new HttpException(
        'Недействительный токен',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.userService.buildUserResponse(user);
  }

  async login(loginUserDto: LoginUserDto): Promise<IResponseUserWithToken> {
    const user = await this.userService.findByLogin(loginUserDto);
    const returnUser = this.userService.buildUserResponse(user);

    const accessToken = this._createToken(returnUser);
    const refreshToken = this._createRefreshToken(returnUser);

    await this.saveRefreshToken(returnUser.user.id, refreshToken);

    return {
      user: returnUser.user,
      refreshToken: refreshToken.token,
      accessToken: accessToken.token,
    };
  }

  async logout(userId: string) {
    try {
      const token = await this.tokenRepository.find({ userId });
      await this.tokenRepository.remove(token);
      return true;
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new HttpException(
        'Срок действия токена обновления истек',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const verifiedTokenInfo = await this.jwtService.verifyAsync(refreshToken);
      const user = await this.userService.findByEmail(verifiedTokenInfo.email);

      if (user) {
        const returnUser = this.userService.buildUserResponse(user);
        const newAccessToken = this._createToken(returnUser);

        return newAccessToken;
      } else {
        throw new HttpException(
          'Срок действия токена обновления истек',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (e) {
      throw new HttpException(
        'Срок действия токена обновления истек',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createAuthCode(userId) {
    try {
      const authCode = crypto.randomBytes(20).toString('hex'); // token 생성

      const oldCode = await this.authRepository.findOne({ where: { userId } });
      if (oldCode) {
        await this.authRepository.update({ userId }, { authCode, ttl: 300 });
      } else {
        const data = {
          authCode,
          userId,
          ttl: 300,
        };
        await this.authRepository.save(data);
      }
      return authCode;
    } catch (e) {
      console.error(e);
      throw new HttpException(
        'Ошибка при создании кода аутентификации',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendMail(userId, userEmail): Promise<void> {
    const authCode = await this.createAuthCode(userId);

    const mailOption = {
      to: userEmail,
      from: '"No Reply - NestJs <nestjs-study@ing>',
      subject: 'Изменение тестового пароля', // Subject line
      html: `Перейдите по следующей ссылке, чтобы сбросить свой пароль. Перейдите на страницу смены пароля <a href="http://localhost:3000/reset-password /${authCode}">Изменить пароль< / a>`,
    };
    try {
      await this.mailerService.sendMail(mailOption);
    } catch (e) {
      throw new HttpException(
        'Ошибка отправки почты',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private isValidCode(authCode) {
    return Date.now() - authCode.ttl > authCode.created;
  }

  async findAuthCode(code: string) {
    try {
      const authCodeData = await this.authRepository.findOne({
        authCode: code,
      });

      if (!authCodeData || !this.isValidCode(authCodeData)) {
        throw new HttpException(
          'not such auth code or outdated code',
          HttpStatus.BAD_REQUEST,
        );
      }
      return authCodeData;
    } catch (e) {
      console.error(e);
      throw new HttpException('not valid auth code', HttpStatus.BAD_REQUEST);
    }
  }

  async removeAuthCodeData(authEntity: AuthEntity) {
    try {
      await this.authRepository.remove(authEntity);
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException('error in removeAuthCodeData');
    }
  }

  async verifyPassword(plainTextPassword: string, hashedPassword: string) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatching) {
      throw new HttpException(
        'Неправильные учетные данные',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async saveRefreshToken(userId, tokenInfo) {
    const { token, expiresIn } = tokenInfo;

    const tokenFound = await this.tokenRepository.find({ userId });
    if (tokenFound) {
      await this.tokenRepository.delete({ userId });
    }

    const expiration = new Date();
    expiration.setTime(expiration.getTime() + Number(expiresIn));

    return await this.tokenRepository.save({
      token,
      userId,
      isRevoked: false,
      expires: expiration,
    });
  }

  private _createToken({ user }: IUserResponse) {
    const token = this.jwtService.sign({ email: user.email });

    return {
      expiresIn: this.configService.get<string>('EXPIRES_IN'),
      token,
    };
  }

  private _createRefreshToken({ user }: IUserResponse) {
    const token = this.jwtService.sign(
      { email: user.email },
      {
        expiresIn: '14d',
      },
    );
    return {
      expiresIn: String(1000 * 60 * 60 * 24 * 14), // '14d'
      token,
    };
  }
}
