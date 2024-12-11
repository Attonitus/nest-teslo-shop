import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/')

  const config = new DocumentBuilder()
  .setTitle('Teslo Shop RESTful API')
  .setDescription('Teslo shop endpoints')
  .setVersion('1.0')
  .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useGlobalPipes(  
    new ValidationPipe({ 
      whitelist: true, 
      forbidNonWhitelisted: true, 
    }) 
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
