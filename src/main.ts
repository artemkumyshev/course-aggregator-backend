import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const PORT = Number(process.env.PORT) || 5000;
  const GLOBAL_PREFIX = process.env.GLOBAL_PREFIX || '';

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.listen(PORT);
  app.setGlobalPrefix(GLOBAL_PREFIX);
}
bootstrap();
