import { IsString, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @MaxLength(50, { message: 'Это имя недопустимо' })
  readonly value: string;

  @IsString()
  @MaxLength(100, { message: 'Это описание недопустимо' })
  readonly description: string;
}
