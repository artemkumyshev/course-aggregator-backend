import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

import { PASSWORD_REGEX } from '../auth.constants';

export class SignUpAuthDto {
  @ApiProperty({ description: 'Электронная почта' })
  @IsNotEmpty({ message: 'Поле "Email" обязательно' })
  @IsEmail({}, { message: 'Поле "Email" должно быть электронным адресом' })
  email: string;

  @ApiProperty({ description: 'Пароль' })
  @IsNotEmpty({ message: 'Поле "Пароль" обязательно' })
  @MinLength(8, {
    message: 'Поле "Пароль" должно содержать не менее 8 символов',
  })
  @Matches(PASSWORD_REGEX, {
    message:
      'Поле "Пароль" должно содержать не менее 8 символов, строчные и прописные буквы, а также символ',
  })
  password: string;

  @ApiProperty({ description: 'Имя пользователя' })
  @IsNotEmpty({ message: 'Поле "Имя пользователя" обязательно' })
  @IsString({ message: 'Поле "Имя пользователя" должно быть строкой' })
  firstName: string;

  @ApiProperty({ description: 'Фамилия пользователя' })
  @IsNotEmpty({ message: 'Поле "Фамилия пользователя" обязательно' })
  @IsString({ message: 'Поле "Фамилия пользователя" должно быть строкой' })
  lastName: string;
}
