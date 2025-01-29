import { INestApplication, Logger } from '@nestjs/common'
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger'
import basicAuth from 'express-basic-auth'
import color from 'colors-cli/safe'

export namespace Swagger {
    export namespace Config {
        export interface SwaggerServer {
            url: string
            description: string
        }
        export interface Env {
            NODE_ENV: string

            prefix: string
            additional_servers: SwaggerServer[]

            api_host_full: string
            api_port: number

            enable: boolean

            protect: boolean
            username: string
            password: string
        }
        export let CONTACTS: [string, string, string] = ['ToxesFoxes', 'https://toxesfoxes.kz', 'toxes_foxes@outlook.com']
        export let DESCRIPTION = 'Docs'
        export let TITLE = 'REST API'
        export let VERSION = '1.0.0'
        export let SWAGGER_PATH = '/docs'
        export let SWAGGER_PATHS = [
            { name: " UI ", path: `${SWAGGER_PATH}`, },
            { name: "JSON", path: `${SWAGGER_PATH}-json`, },
            { name: "YAML", path: `${SWAGGER_PATH}-yaml`, },
        ]
        export const logger = new Logger('SwaggerModule', { timestamp: true })
    }

    export namespace Core {
        export const addTags = (builder: DocumentBuilder, tags: { name: string, description: string }[]) => {
            for (const key in tags) {
                if (Object.prototype.hasOwnProperty.call(tags, key)) {
                    const tag = tags[key]
                    builder.addTag(tag.name, tag.description)
                }
            }
        }

        export const addServers = <Env extends Config.Env>(builder: DocumentBuilder, config: Env, servers: { url: string, description: string }[]) => {
            const API_SWAGGER_ADDITIONAL_SERVERS = config['additional_servers']
            for (const key in servers) {
                if (Object.prototype.hasOwnProperty.call(servers, key)) {
                    const server = servers[key]
                    builder.addServer(server.url, server.description)
                }
            }
            if (API_SWAGGER_ADDITIONAL_SERVERS) {
                try {
                    for (const key in API_SWAGGER_ADDITIONAL_SERVERS) {
                        if (Object.prototype.hasOwnProperty.call(API_SWAGGER_ADDITIONAL_SERVERS, key)) {
                            const server = API_SWAGGER_ADDITIONAL_SERVERS[key]
                            builder.addServer(server.url, server.description)
                        }
                    }
                } catch (error) {
                    console.error(error)
                }
            }
        }

        export const buildDocument = async <Env extends Config.Env>(app: INestApplication, config: Env) => {
            const API_HOST_FULL = config['api_host_full']
            const PORT = config['api_port']

            const swaggerConfig = new DocumentBuilder()
                .setTitle(Config.TITLE)
                .setDescription(Config.DESCRIPTION)
                .setVersion(Config.VERSION)
                .setContact(...Config.CONTACTS)

            addServers(swaggerConfig, config, [
                { url: API_HOST_FULL, description: 'Текущий сервер' },
                { url: `http://localhost:${PORT}`, description: 'Локальный сервер' },
            ])

            addTags(swaggerConfig, DynamicConfig.tags)

            const builtConfig = swaggerConfig.build()
            const swaggerDocument = SwaggerModule.createDocument(app, builtConfig)

            return swaggerDocument
        }

        export const enabled = <Env extends Config.Env>(config: Env) => {
            return (config['NODE_ENV'] === 'development' || config['enable'])
        }
    }

    export namespace DynamicConfig {
        export let tags: { name: string, description: string }[] = []
        export const addTag = (name: string, description: string) => {
            tags.push({ name, description })
        }
        export const addTags = (tagsList: { name: string, description: string }[]) => {
            tags.push(...tagsList)
        }
        export const setTags = (tagsList: { name: string, description: string }[]) => {
            tags = [...tagsList]
        }
    }

    export const setup = <Env extends Config.Env>(app: INestApplication, config: Env, swaggerDocument: OpenAPIObject) => {
        if (Core.enabled(config)) {
            const API_SWAGGER_PREFIX = config['prefix']
            protect(config, app)

            SwaggerModule.setup(`${API_SWAGGER_PREFIX}/docs`, app, swaggerDocument, {
                swaggerOptions: {
                    docExpansion: 'none',
                    filter: true,
                    showRequestDuration: true,
                },
            })
        }
    }

    export const logOnLoad = <Env extends Config.Env>(config: Env) => {
        if (Core.enabled(config)) {
            const API_SWAGGER_PROTECT = config['protect']
            const API_SWAGGER_PREFIX = config['prefix']
            const API_HOST_FULL = config['api_host_full']
            const PRFX = API_SWAGGER_PREFIX ? '/' + API_SWAGGER_PREFIX : ''
            Config.SWAGGER_PATHS.forEach((route) => {
                Config.logger.log([color.x0(`📕 ${route.name} on `), color.cyan(API_HOST_FULL), color.green(PRFX), color.cyan(route.path),].join(''))
            })
            if (API_SWAGGER_PROTECT) {
                Config.logger.log(`🔐 Swagger routes protected via basic auth.`)
            } else {
                Config.logger.warn(`🔓 Swagger routes are not protected.`)
                if (config['NODE_ENV'] === 'production') {
                    Config.logger.warn(`🔴 Swagger routes are not protected in production environment!`)
                }
            }
        }
    }

    export const protect = <Env extends Config.Env>(config: Env, app: INestApplication) => {
        const API_SWAGGER_PROTECT = config['protect']
        const API_SWAGGER_USERNAME = config['username']
        const API_SWAGGER_PASSWORD = config['password']
        const API_SWAGGER_PREFIX = config['prefix']
        if (API_SWAGGER_PROTECT) {
            app.use(
                Config.SWAGGER_PATHS.map((route) => `${API_SWAGGER_PREFIX ? '/' + API_SWAGGER_PREFIX : ''}${route.path}*`),
                basicAuth({
                    challenge: true,
                    users: { [API_SWAGGER_USERNAME]: API_SWAGGER_PASSWORD, },
                }),
            )
        }
    }
}