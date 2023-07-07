import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import compression from '@fastify/compress';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import multipart from '@fastify/multipart';
import helmet from '@fastify/helmet';
import fastifyFormbody from '@fastify/formbody';

const pkg = require('../package.json');

export const bootstrap = async () => {
  const isprd: boolean = process.env.NODE_ENV === 'production';

  const adapter = new FastifyAdapter({
    logger: isprd,
    bodyLimit: 200 * 1024 * 1024,
  });
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    {
      logger: isprd ? ['warn', 'error'] : ['log', 'error', 'warn', 'debug'],
      bodyParser: false,
    },
  );
  //   const configService = app.get(ConfigService);

  app.register(compression);
  app.register(multipart, { attachFieldsToBody: true });
  app.register(fastifyFormbody);
  app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdnjs.cloudflare.com'],
      },
    },
  });
  app.setGlobalPrefix('v1');
  app.enableVersioning();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  /*** api doc***/
  const config = new DocumentBuilder()
    .setTitle(`${pkg.name}`)
    .setDescription(pkg.description)
    .setVersion(pkg.version)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);
  app.enableCors();
  await app.init();
  return app;
};
