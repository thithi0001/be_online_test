import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import 'reflect-metadata';
import { SubjectController } from './modules/subject/subject.controller';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: true,
      // forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new PrismaExceptionFilter());

  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log('it is running')
  console.log(process.env.DB_NAME)



  console.log(app.getHttpAdapter().getInstance().constructor.name);
}
bootstrap();

