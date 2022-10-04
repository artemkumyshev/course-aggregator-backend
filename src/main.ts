import { UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const PORT = Number(process.env.PORT) || 5000;
  const allowedOrigins = [
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost',
    'http://localhost:3000',
    'http://localhost:8787',
  ];
  const GLOBAL_PREFIX = process.env.GLOBAL_PREFIX || '';
  const config = new DocumentBuilder()
    .setTitle('Агрегатор Курсов')
    .setDescription('Документация по Rest API')
    .setVersion('1.0.0')
    .build();
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    allowedHeaders:
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, Set-Cookie, Cookies',
    credentials: true,
    origin: (origin, callback) => {
      const whitelist = allowedOrigins;
      const canAllowUndefinedOrigin = origin === undefined;

      if (whitelist.indexOf(origin) !== -1 || canAllowUndefinedOrigin) {
        callback(null, true);
      } else {
        callback(
          new UnauthorizedException(
            `Not allowed by CORS for origin: ${origin}}`,
          ),
        );
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });
  app.setGlobalPrefix(GLOBAL_PREFIX);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.listen(PORT);
}

bootstrap();
