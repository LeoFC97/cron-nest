/* istanbul ignore file */

import { ClassSerializerInterceptor, HttpException, INestApplication, Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { useContainer } from 'class-validator'
import { FastifyInstance } from 'fastify'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'

const loggerInstance = new Logger('Bootstrap')
export const setupSwagger = (app: INestApplication) => {
  const options = new DocumentBuilder()
    .setTitle('cronjob nest example')
    .setDescription('example of how to use cronjob with nestjs rest api')
    .setVersion('0.1')
    .build()

  const document = SwaggerModule.createDocument(app, options)
  const path = '/docs'

  SwaggerModule.setup(path, app, document)
}

/**
 * Bootstrap the app.
 */
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      ignoreTrailingSlash: true
    }),
    { logger: ['error', 'debug', 'log', 'warn', 'verbose'] }
  )
  app.setGlobalPrefix(`api`)
  setupSwagger(app)
  app.enableCors()
  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  const fastifyApp = app.getHttpAdapter().getInstance() as FastifyInstance

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidUnknownValues: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  )
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get<Reflector>(Reflector), {
      enableImplicitConversion: true
    })
  )
  await app.listen('8085')
  loggerInstance.log(`Application is running on: ${await app.getUrl()}`)
}

// Start the app
bootstrap().catch((error) => loggerInstance.error(error))
