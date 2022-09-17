import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { UserService } from './user.service';

@Controller('users')
@ApiTags('Пользователи')
export class UserController {
  constructor(private readonly userService: UserService) {}
}
