import { IPayloadEmail } from './../../user/user.service';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthService } from './../auth.service';
import { IUserResponse } from 'src/modules/user/types/userResponse.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('SECRET_KEY'),
    });
  }

  async validate(payload: IPayloadEmail): Promise<IUserResponse> {
    const user = await this.authService.validateUser(payload);

    if (!user) {
      throw new HttpException('Недопустимый токен', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }
}
