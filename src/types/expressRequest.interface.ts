import { Request } from 'express';
import { UserEntity } from 'src/user/entities/user.entity';

export interface IExpressRequest extends Request {
  user?: UserEntity;
}
