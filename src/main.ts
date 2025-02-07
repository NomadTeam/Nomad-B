import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import { HttpExceptionFilter } from '@common/filters/http-exception-filter';
import { InternalServerError } from '@common/filters/server-error-exception';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api');
  app.useGlobalFilters(new HttpExceptionFilter(), new InternalServerError());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
