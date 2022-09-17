import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const PORT = Number(process.env.PORT) || 5000;
  const GLOBAL_PREFIX = process.env.GLOBAL_PREFIX || '';
  const config = new DocumentBuilder()
    .setTitle('Агрегатор Курсов')
    .setDescription('Документация по Rest API')
    .setVersion('1.0.0')
    .build();
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.setGlobalPrefix(GLOBAL_PREFIX);
  app.useGlobalPipes(new ValidationPipe());

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.listen(PORT);
}

bootstrap();
