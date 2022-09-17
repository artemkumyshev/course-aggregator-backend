import { Entity, Column, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

import { AbstractEntity } from 'src/abstract.entity';

@Entity('token')
export class TokenEntity extends AbstractEntity {
  @ApiProperty({ description: 'Токен' })
  @PrimaryColumn()
  token: string;

  @ApiProperty({
    example: '8f54829f-e13f-479b-ae89-7dc9960c81b0',
    description: 'Идентификатор пользователя',
  })
  @IsNotEmpty({ message: 'Идентификатор пользователя обязателен' })
  @Column({ type: 'varchar', nullable: false })
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: false,
    description: 'Аннулирован',
  })
  @Column({ default: false })
  isRevoked: boolean;

  @ApiProperty({
    description: 'Cрок действия',
  })
  @Column()
  expires: Date;
}
