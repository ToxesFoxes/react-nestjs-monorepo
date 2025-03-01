import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ScalarUI, Swagger } from '@toxesfoxes/nest-swagger'
import { UnhandledExceptionFilter } from './engine/filters/unhandled-exception.filter'
import { InternalDisabledLogger } from './engine/loggers/disable-standart-logs.logger'
import { NestExpressApplication } from '@nestjs/platform-express'
import { Logger } from '@nestjs/common'
const logger = new Logger()

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: new InternalDisabledLogger(),
        cors: true,
    })

    process.on('uncaughtException', (error: Error) => {
        logger.error('unhandled-error', { error, stack: error.stack })
        process.exit(1)
    })

    process.on('unhandledRejection', (reason: any) => {
        logger.error('unhandled-promise', { reason, stack: reason.stack })
    })

    app.useGlobalFilters(new UnhandledExceptionFilter())
    app.useBodyParser('json', { limit: '50kb' })
    app.useBodyParser('urlencoded', { limit: '50mb', extended: true, })

    const swaggerConfig: Swagger.Config.Env = {
        additional_servers: [],
        api_host_full: 'http://localhost:3000',
        api_port: 3000,
        enable: true,
        NODE_ENV: 'development',
        prefix: 'api',
        protect: false,
        username: 'admin',
        password: 'default',
    }
    const swaggerDocument = await Swagger.Core.buildDocument(app, swaggerConfig)
    Swagger.setup(app, swaggerConfig, swaggerDocument)
    ScalarUI.setup(app, swaggerConfig, swaggerDocument)

    await app.listen(3000, () => {
        Swagger.logOnLoad(swaggerConfig)
        ScalarUI.logOnLoad(swaggerConfig)
    })
}

bootstrap().catch((error) => {
    logger.error('bootstrap-error', { error, stack: error.stack })
    process.exit(1)
})
