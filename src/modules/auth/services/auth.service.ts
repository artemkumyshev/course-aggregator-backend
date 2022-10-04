import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { compare, genSaltSync, hashSync } from 'bcrypt';

import { SignUpAuthDto } from '../dto/signup-auth.dto';
import { SignInAuthDto } from '../dto/signin-auth.dto';
import { UserEntity } from '../entities/user.entity';
import {
  ALREADY_REGISTERED_ERROR,
  USER_DATA_INCORRET,
} from '../auth.constants';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(signUpAuthDto: SignUpAuthDto) {
    const user = await this.userService.findUserByEmail(signUpAuthDto.email);

    if (user) {
      throw new BadRequestException(ALREADY_REGISTERED_ERROR);
    }

    const salt = await genSaltSync(10);
    const hashPassword = await hashSync(signUpAuthDto.password, salt);

    const newUser = await this.userRepository.create({
      ...signUpAuthDto,
      password: hashPassword,
    });

    return await this.userRepository.save(newUser);
  }

  async signIn({ email, password }: SignInAuthDto): Promise<UserEntity> {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException(USER_DATA_INCORRET);
    }

    const isCorrectPassword = await compare(password, user.password);
    if (!isCorrectPassword) {
      throw new UnauthorizedException(USER_DATA_INCORRET);
    }

    return user;
  }

  async signOut(id: string): Promise<void> {
    const user = await this.userService.findUserById(id);
    user.currentHashedRefreshToken = null;
    await this.userRepository.save(user);
    return;
  }

  async getProfile(id: string): Promise<UserEntity> {
    return await this.userService.findUserById(id);
  }

  async vaildateUser(email: string, plainTextPassword: string): Promise<any> {
    try {
      const user = await this.userService.findUserByEmail(email);
      await this.verifyPassword(plainTextPassword, user.password);
      const { password, ...result } = user;
      return result;
    } catch (error) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  getCookieWithJwtAccessToken(id: string) {
    const payload = { id };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      )}s`,
    });

    return {
      accessToken: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      maxAge:
        Number(this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')) *
        1000,
    };
  }

  getCookieWithJwtRefreshToken(id: string) {
    const payload = { id };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      )}s`,
    });

    return {
      refreshToken: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      maxAge:
        Number(this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')) *
        1000,
    };
  }

  getCookiesForLogOut() {
    return {
      accessOption: {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        maxAge: 0,
      },
      refreshOption: {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        maxAge: 0,
      },
    };
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatch = await compare(plainTextPassword, hashedPassword);
    if (!isPasswordMatch) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
