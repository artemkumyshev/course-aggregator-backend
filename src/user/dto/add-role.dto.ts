import { ApiProperty } from '@nestjs/swagger';

export class AddRoleDto {
  @ApiProperty({ example: 'ADMIN', description: 'Название роли' })
  readonly value: string;

  @ApiProperty({ example: '13189в089', description: 'ID пользователя' })
  readonly userId: string;
}
