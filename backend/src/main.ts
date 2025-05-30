import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000',  // atau '*' untuk semua origin
    credentials: true,
  });
  await app.listen(3004);
}
bootstrap();