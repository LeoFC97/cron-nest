import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { useContainer } from 'class-validator';
import { AppModule } from './../src/app.module';

/**
 * Default API prefix.
 */
const DEFAULT_PREFIX = '/api/v1';

describe('HealthCheck (e2e)', () => {
  const prefix = process.env.PREFIX || DEFAULT_PREFIX;
  let app: NestFastifyApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    app.setGlobalPrefix(prefix);
    app.enableCors();
    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidUnknownValues: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe(`GET ${prefix}/healthcheck`, () => {
    it(`should successfully retrieve application health status`, async () => {
      return app
        .inject({
          method: 'GET',
          url: `${prefix}/healthcheck`,
        })
        .then(({ payload }) => {
          const expectedResponse = {
            status: 'ok',
            details: {
              app: {
                status: 'up',
              },
            },
            error: {},
            info: {
              app: {
                status: 'up',
              },
            },
          };
          expect(JSON.parse(payload)).toEqual(expectedResponse);
        });
    });
  });
});
