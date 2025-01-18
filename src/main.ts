import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filter/http-exception/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import { WrapResponseInterceptor } from './common/interceptor/wrap-response/wrap-response.interceptor';
import { TimeoutInterceptor } from './common/interceptor/timeout/timeout.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove unwanted properties from the incoming data
      forbidNonWhitelisted: true, // Throw an error if unwanted properties are present in the incoming data
      transform: true, // Automatically transform incoming data to the correct type Defined in DTO
      transformOptions: {
        enableImplicitConversion: true, // Enable implicit conversion
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalInterceptors(
    new WrapResponseInterceptor(),
    new TimeoutInterceptor(),
  );

  const config = new DocumentBuilder()
    .setTitle('Iluvcoffee')
    .setDescription('Coffee application')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(configService.get<number>('PORT') ?? 3000);
}
bootstrap();
