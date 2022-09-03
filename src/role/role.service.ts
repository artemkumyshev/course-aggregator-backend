import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RoleEntity } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async create(dto: CreateRoleDto) {
    const savedRole = await this.roleRepository.save(dto);

    return savedRole;
  }

  async getRoleByValue(name: string) {
    const role = await this.roleRepository.findOne({ where: { name } });

    return role;
  }
}
