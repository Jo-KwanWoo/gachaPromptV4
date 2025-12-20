import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // DTO 검증 파이프
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 예외 필터 등록
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(3000);
  console.log('Device Registration System is running on http://localhost:3000');
}
bootstrap();