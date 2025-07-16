import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

    app.useGlobalPipes(new ValidationPipe());
  await app.listen(3001);
  console.log('Execution engine running on http://localhost:3001');
}
bootstrap();