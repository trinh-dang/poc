import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger as PinoLogger } from 'nestjs-pino';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  app.useLogger(app.get(PinoLogger));
  app.setGlobalPrefix('api');

  await app.listen(3000);
}

bootstrap()
  .then(() => {
    new Logger('Bootstrap').log(`Server is listening on port 3000`);
  })
  .catch((err) => {
    new Logger('Bootstrap').error(`Error starting server, ${err}`);
    throw err;
  });
