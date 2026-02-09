import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // 기본 false = 없는 property도 출력 됨
    forbidNonWhitelisted: true // 정의되지 않은 property는 에러를 출력하게 함
  }))
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
