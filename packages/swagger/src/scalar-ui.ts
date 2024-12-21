import { INestApplication, Logger } from '@nestjs/common'
import { Swagger } from './swagger'
import { OpenAPIObject } from '@nestjs/swagger'
import { apiReference, NestJSReferenceConfiguration } from '@scalar/nestjs-api-reference'
import color from 'colors-cli/safe'
import basicAuth from 'express-basic-auth'

export namespace ScalarUI {
    export namespace Config {
        export let SCALAR_PATHS = [
            { name: " UI ", path: `${Swagger.Config.SWAGGER_PATH}-reference`, },
        ]
        export const logger = new Logger('ScalarUIModule', { timestamp: true })
    }

    export const setup = async <Env extends Swagger.Config.Env>(app: INestApplication, config: Env, swaggerDocument: OpenAPIObject) => {
        if (Swagger.Core.enabled(config)) {
            const API_SWAGGER_PREFIX = config['prefix']
            ScalarUI.protect(config, app)
            const PRFX = API_SWAGGER_PREFIX ? '/' + API_SWAGGER_PREFIX : ''

            Config.SCALAR_PATHS.forEach((route) => {
                app.use(
                    `${PRFX}${route.path}`,
                    apiReference({
                        hideDownloadButton: true,
                        darkMode: true,
                        theme: 'deepSpace',
                        spec: {
                            content: swaggerDocument,
                        },
                    } as NestJSReferenceConfiguration),
                )
            })
        }
    }

    export const logOnLoad = <Env extends Swagger.Config.Env>(config: Env) => {
        if (Swagger.Core.enabled(config)) {
            const API_SWAGGER_PROTECT = config['protect']
            const API_SWAGGER_PREFIX = config['prefix']
            const API_HOST_FULL = config['api_host_full']
            const PRFX = API_SWAGGER_PREFIX ? '/' + API_SWAGGER_PREFIX : ''
            Config.SCALAR_PATHS.forEach((route) => {
                ScalarUI.Config.logger.log([color.x0(`📕 ${route.name} on `), color.cyan(API_HOST_FULL), color.green(PRFX), color.cyan(route.path),].join(''))
            })
            if (API_SWAGGER_PROTECT) {
                ScalarUI.Config.logger.log(`🔐 ScalarUI routes protected via basic auth.`)
            } else {
                ScalarUI.Config.logger.warn(`🔓 ScalarUI routes are not protected.`)
                if (config['NODE_ENV'] === 'production') {
                    ScalarUI.Config.logger.warn(`🔴 ScalarUI routes are not protected in production environment!`)
                }
            }
        }
    }

    export const protect = <Env extends Swagger.Config.Env>(config: Env, app: INestApplication) => {
        const API_SWAGGER_PROTECT = config['protect']
        const API_SWAGGER_LOGIN = config['username']
        const API_SWAGGER_PASSWORD = config['password']
        const API_SWAGGER_PREFIX = config['prefix']
        const PRFX = API_SWAGGER_PREFIX ? '/' + API_SWAGGER_PREFIX : ''
        if (API_SWAGGER_PROTECT) {
            app.use(
                Config.SCALAR_PATHS.map((route) => `${PRFX}${route.path}*`),
                basicAuth({
                    challenge: true,
                    users: { [API_SWAGGER_LOGIN]: API_SWAGGER_PASSWORD, },
                }),
            )
        }
    }

}