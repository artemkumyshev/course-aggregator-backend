import { ApiProperty } from '@nestjs/swagger';

export class BanUserDto {
  @ApiProperty({ example: '13189в089', description: 'ID пользователя' })
  readonly userId: string;

  @ApiProperty({ example: 'Спамит', description: 'Причина бана' })
  readonly banReason: string;
}
