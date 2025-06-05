import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // ✅ Enable CORS
  app.enableCors({
    origin: '*', // Your frontend origin (e.g. Vite dev server)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
  });

  app.set('query parser', 'extended'); // <-- Add this line
  await app.listen(3000);
}
bootstrap();
