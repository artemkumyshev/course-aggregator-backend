import { Column, Entity } from 'typeorm';
import { Exclude } from 'class-transformer';

import BaseEntity from 'src/shared/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class UserEntity extends BaseEntity {
  constructor(partial: Partial<UserEntity>) {
    super();
    Object.assign(this, partial);
  }

  @ApiProperty({ description: 'Электронная почта' })
  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100 })
  @ApiProperty({ description: 'Имя пользователя' })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  @ApiProperty()
  @ApiProperty({ description: 'Фамилия пользователя' })
  lastName: string;

  @Column({ type: 'text' })
  @Exclude()
  password: string;

  @Column({ nullable: true })
  @Exclude()
  currentHashedRefreshToken: string;
}
