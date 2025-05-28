import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: 'http://localhost:3000', // ganti sesuai URL frontend
      credentials: true,
    },
  });

  await app.listen(3004); // atau port yang kamu pakai
}
bootstrap();
