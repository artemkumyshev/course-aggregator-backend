import { HttpException, Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { comparePasswords } from 'src/utils/comparePasswords';

import { IUserResponse } from './types/userResponse.interface';

import { UserEntity } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

export interface IPayloadEmail {
  email: string;
}

@Injectable()
export class UserService {
  private MAX_LOGIN_COUNT = 5;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findOne(options?: Record<string, unknown>): Promise<UserEntity> {
    const user = await this.userRepository.findOne(options);
    return user;
  }

  async findById(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ id: userId });

    if (user) {
      return user;
    }

    throw new HttpException(
      'Пользователь с таким идентификатором не существует',
      HttpStatus.NOT_FOUND,
    );
  }

  async findByEmail(email: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ email });

    if (user) {
      return user;
    }

    throw new HttpException(
      'Пользователь с таким электронным адресом не существует',
      HttpStatus.NOT_FOUND,
    );
  }

  async findByLogin(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email },
    });

    if (!user) {
      throw new HttpException(
        'Пользователь с таким электронным адресом не найден',
        HttpStatus.NOT_FOUND,
      );
    }

    const isEqual = await comparePasswords(
      user.password,
      loginUserDto.password,
    );

    if (!isEqual) {
      throw new HttpException(
        'Недействительные учетные данные',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const findUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (findUser) {
      throw new HttpException(
        'Пользователь с таким электронным адресом уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newUser = this.userRepository.create(createUserDto);
    await this.userRepository.save(newUser);

    return newUser;
  }

  async changePasswordAndUnlock(
    userId: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findById(userId);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(user.id, {
      loginFailCount: 0,
      isLocked: false,
      password: hashedPassword,
    });
  }

  async checkLoginTryCount(email: string): Promise<[number, boolean]> {
    const user = await this.findByEmail(email);
    let updateData: Record<string, any> = {
      latestLoginTryDate: new Date(),
    };
    if (user.loginFailCount >= this.MAX_LOGIN_COUNT) {
      updateData = { ...updateData, isLocked: true };
    } else {
      updateData = { ...updateData, loginFailCount: user.loginFailCount + 1 };
    }

    try {
      await this.userRepository.update({ email: user.email }, updateData);
      return [user.loginFailCount, user.isLocked];
    } catch (e) {
      throw new HttpException(
        'Ошибка при обновлении счетчика входа в систему ',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  buildUserResponse(user: UserEntity): IUserResponse {
    user.createdAt = undefined;
    user.updateAt = undefined;
    user.password = undefined;
    user.isLocked = undefined;
    user.latestLoginTryDate = undefined;
    user.lockCount = undefined;
    user.loginFailCount = undefined;

    return {
      user,
    };
  }
}
