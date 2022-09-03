import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from 'src/user/entities/user.entity';
import { RoleService } from 'src/role/role.service';
import { CreateUserDto } from './dto/create-user.dto';
import { BanUserDto } from './dto/ban-user.dto';
import { AddRoleDto } from './dto/add-role.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly roleService: RoleService,
  ) {}

  async createUser({ email, password }: CreateUserDto) {
    const findRole = await this.roleService.getRoleByValue('USER');

    const user = new UserEntity();
    user.email = email;
    user.password = password;
    if (findRole) {
      user.roles = [
        {
          id: findRole.id,
          name: findRole.name,
          description: findRole.description,
        },
      ];
    }

    return this.userRepository.save(user);
  }

  async getAllUsers() {
    const users = await this.userRepository.find();

    return users;
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    return user;
  }

  async addRole(dto: AddRoleDto) {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });
    const role = await this.roleService.getRoleByValue(dto.value);

    if (role && user) {
      await this.userRepository.save({
        ...user,
        roles: [
          ...user.roles,
          { id: role.id, name: role.name, description: role.description },
        ],
      });

      return dto;
    }

    throw new HttpException(
      'Пользователь или роль не найдена',
      HttpStatus.NOT_FOUND,
    );
  }

  async ban(dto: BanUserDto) {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });
    user.isBanned = true;
    user.banReason = dto.banReason;

    await this.userRepository.save(user);

    return user;
  }
}
