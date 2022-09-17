import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryColumn } from 'typeorm';

import { AbstractEntity } from 'src/abstract.entity';
import { IsNotEmpty } from 'class-validator';

@Entity({ name: 'auth' })
export class AuthEntity extends AbstractEntity {
  @ApiProperty({ description: 'Код авторизации' })
  @PrimaryColumn()
  authCode: string;

  @ApiProperty({
    example: '8f54829f-e13f-479b-ae89-7dc9960c81b0',
    description: 'Идентификатор пользователя',
  })
  @IsNotEmpty({ message: 'Идентификатор пользователя обязателен' })
  @Column({ type: 'varchar', nullable: false })
  userId: string;

  @ApiProperty({
    example: 300,
    description: 'TTL',
  })
  @Column({ default: 300 }) // 5분
  ttl: number;
}
