import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const httpsOptions = {
    cert: fs.readFileSync(path.join(__dirname + '../../cert.pem')),
    key: fs.readFileSync(path.join(__dirname + '../../key.pem')),
  };

  const PORT = process.env.PORT || 5000;

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });
  app.setGlobalPrefix('api');
  app.enableCors();
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('newInstagram')
    .setDescription('app where all people can post photos')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(PORT, () =>
    console.log(`server has been started on port ${PORT}`),
  );
}
bootstrap();
