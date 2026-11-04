import { INestApplication, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { BRAND } from '@backendmasters/shared';
import type { Env } from './config/env.js';
import { APP_VERSION } from './version.js';

/** HTTP setup shared by the real server and integration tests, so tests exercise the same app. */
export function configureApp(app: INestApplication): void {
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  app.use(helmet());
  app.enableCors({
    origin: config
      .get('CORS_ORIGINS', { infer: true })
      .split(',')
      .map((origin) => origin.trim()),
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.enableShutdownHooks();

  const isProduction = config.get('NODE_ENV', { infer: true }) === 'production';
  const swaggerEnabled = config.get('SWAGGER_ENABLED', { infer: true }) ?? !isProduction;
  if (swaggerEnabled) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle(`${BRAND.name} API`)
        .setDescription(BRAND.tagline)
        .setVersion(APP_VERSION)
        .addBearerAuth()
        .build(),
    );
    SwaggerModule.setup('api/docs', app, document);
  }
}
