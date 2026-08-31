import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  // uploads/ is gitignored, so it won't exist on a fresh clone — create it
  // rather than let multer fail with ENOENT on the first photo upload.
  mkdirSync(join(__dirname, '..', 'uploads'), { recursive: true });

  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
