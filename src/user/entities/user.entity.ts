import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { RoleEntity } from 'src/role/entities/role.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'user@email.ru', description: 'Почтовый адрес' })
  @Column({ unique: true, nullable: false })
  email: string;

  @ApiProperty({ example: 'qwerty1123', description: 'Пароль' })
  @Column({ nullable: false })
  password: string;

  @ApiProperty({ example: true, description: 'Заблокирован или нет' })
  @Column({ default: false })
  isBanned: boolean;

  @ApiProperty({
    example: 'Плохие комментарии',
    description: 'Причина блокировки',
  })
  @Column({ nullable: true })
  banReason: string;

  @ManyToMany(
    () => RoleEntity,
    (user) => ({
      id: user.id,
      name: user.name,
      description: user.description,
    }),
    { eager: true },
  )
  @JoinTable({ name: 'user_roles' })
  roles: { id: string; name: string; description: string }[];

  @CreateDateColumn({ type: 'timestamp', name: 'screated_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'update_at' })
  updateAt: Date;
}
