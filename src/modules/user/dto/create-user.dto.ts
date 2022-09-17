import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Email обязателен' })
  @IsEmail({}, { message: 'Неправильный email' })
  @ApiProperty()
  email!: string;

  @IsNotEmpty({ message: 'Имя обязательно' })
  @IsString()
  @ApiProperty()
  firstName!: string;

  @IsNotEmpty({ message: 'Фамилия обязательна' })
  @IsString()
  @ApiProperty()
  lastName!: string;

  @IsNotEmpty({ message: 'Пароль обязателен' })
  @IsString()
  @Length(6, 50, {
    message: 'Пароль должен состоять не менее чем из 6 и не более 30 символов',
  })
  @ApiProperty()
  password!: string;
}
