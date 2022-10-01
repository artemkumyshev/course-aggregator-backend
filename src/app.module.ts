import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import dbConfiguration from './shared/config/db.config';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { DatabaseExceptionFilter } from './shared/filters/database-exception.filter';
import { RequestInterceptor } from './shared/interceptors/request.interceptor';

import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [dbConfiguration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ...configService.get('database'),
      }),
    }),
    AuthModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_FILTER, useClass: DatabaseExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: RequestInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
})
export class AppModule {}
