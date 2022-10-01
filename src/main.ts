import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const PORT = Number(process.env.PORT) || 5000;
  const GLOBAL_PREFIX = process.env.GLOBAL_PREFIX || '';
  const config = new DocumentBuilder()
    .setTitle('Агрегатор Курсов')
    .setDescription('Документация по Rest API')
    .setVersion('1.0.0')
    .build();
  const app = await NestFactory.create(AppModule, { cors: false });
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
