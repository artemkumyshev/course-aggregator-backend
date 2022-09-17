import { ApiProperty } from '@nestjs/swagger';
import { BeforeInsert, Column, Entity } from 'typeorm';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import * as bcrypt from 'bcrypt';

import { AbstractEntity } from 'src/abstract.entity';

@Entity({ name: 'users' })
export class UserEntity extends AbstractEntity {
  @ApiProperty({ example: 'Иван', description: 'Имя' })
  @Column({ type: 'varchar', nullable: false })
  @IsNotEmpty({ message: 'Имя обязательно' })
  firstName!: string;

  @ApiProperty({ example: 'Иванов', description: 'Фамилия' })
  @Column({ type: 'varchar', nullable: false })
  @IsNotEmpty({ message: 'Фамилия обязательна' })
  lastName!: string;

  @ApiProperty({ example: 'user@email.ru', description: 'Email' })
  @Column({ type: 'varchar', unique: true, nullable: false })
  @IsEmail({}, { message: 'Неправильный email' })
  @IsNotEmpty({ message: 'Email обязателен' })
  email!: string;

  @ApiProperty({ example: 'qwerty1123', description: 'Пароль' })
  @Column({ nullable: false })
  @Length(6, 50, {
    message: 'Пароль должен состоять не менее чем из 6 и не более 30 символов',
  })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  password!: string;

  @ApiProperty({ example: 0, description: 'Счетчик отказов входа в систему' })
  @Column({ type: 'integer', default: 0 })
  loginFailCount?: number;

  @ApiProperty({ example: false, description: 'Заблокирован' })
  @Column({ type: 'bool', default: false })
  isLocked?: boolean;

  @ApiProperty({
    example: '11.11.2010',
    description: 'Последняя дата попытки входа',
  })
  @Column({ nullable: true })
  latestLoginTryDate?: Date;

  @ApiProperty({
    example: 0,
    description: 'Количество блокировок',
  })
  @Column({ default: 0 })
  lockCount?: number;

  @BeforeInsert()
  hashPassword = async () => {
    this.password = await bcrypt.hash(this.password, 10);
  };
}
