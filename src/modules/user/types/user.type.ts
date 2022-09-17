import { UserEntity } from '../user.entity';

export type UserType = Omit<
  UserEntity,
  | 'password'
  | 'currentHashedRefreshToken'
  | 'createdAt'
  | 'updateAt'
  | 'hashPassword'
  | 'lockCount'
  | 'latestLoginTryDate'
  | 'isLocked'
  | 'loginFailCount'
>;
