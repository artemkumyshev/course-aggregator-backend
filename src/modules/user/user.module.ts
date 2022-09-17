import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// User
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
