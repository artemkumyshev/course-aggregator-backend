import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';

export class SignInAuthDto {
  @ApiProperty({ description: 'Электронная почта' })
  @IsNotEmpty({ message: 'Поле "Email" обязательно' })
  @IsEmail({}, { message: 'Поле "Email" должно быть электронным адресом' })
  email: string;

  @ApiProperty({ description: 'Пароль' })
  @IsNotEmpty({ message: 'Поле "Пароль" обязательно' })
  password: string;
}
