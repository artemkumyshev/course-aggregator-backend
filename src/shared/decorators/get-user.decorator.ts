import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';
import { UserEntity } from 'src/modules/auth/entities/user.entity';

export const GetUser = createParamDecorator(
  (_data, ctx: ExecutionContext): UserEntity => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
