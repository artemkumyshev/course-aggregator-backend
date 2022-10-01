import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

class BaseEntity {
  @ApiProperty({ description: ' Уникальный идентификатор' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  @Exclude()
  updatedAt: Date;
}

export default BaseEntity;
