import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ScalarUI, Swagger } from '@toxesfoxes/nest-swagger'
import { UnhandledExceptionFilter } from './engine/filters/unhandled-exception.filter'
import { InternalDisabledLogger } from './engine/loggers/disable-standart-logs.logger'
import { NestExpressApplication } from '@nestjs/platform-express'
import { Logger } from '@nestjs/common'
import { AppConfig } from './engine/env/config'
import { GlobalConfig } from './engine/env/config/global.config'
import { SwaggerConfig } from './engine/env/config/swagger.config'
const logger = new Logger()

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: new InternalDisabledLogger(),
        cors: true,
    })

    const appCfg = AppConfig()
    const globalCfg = GlobalConfig()
    const swaggerCfg = SwaggerConfig()

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
    app.setGlobalPrefix(globalCfg.prefix)

    const swaggerConfig: Swagger.Config.Env = {
        NODE_ENV: process.env.NODE_ENV || 'development',
        api_host_full: appCfg.base_url,
        api_port: appCfg.port,
        prefix: globalCfg.prefix,
        enable: swaggerCfg.enable,
        protect: swaggerCfg.protect.enable,
        username: swaggerCfg.protect.username,
        password: swaggerCfg.protect.password,
        additional_servers: swaggerCfg.additional_servers,
    }

    const swaggerDocument = await Swagger.Core.buildDocument(app, swaggerConfig)
    Swagger.setup(app, swaggerConfig, swaggerDocument)
    ScalarUI.setup(app, swaggerConfig, swaggerDocument)

    await app.listen(appCfg.port, () => {
        Swagger.logOnLoad(swaggerConfig)
        ScalarUI.logOnLoad(swaggerConfig)
    })
}

bootstrap().catch((error) => {
    logger.error('bootstrap-error', { error, stack: error.stack })
    process.exit(1)
})
