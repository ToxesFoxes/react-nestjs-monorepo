import { ConfigType, registerAs } from '@nestjs/config'
import { env, envNumber } from '../helpers'

export const appRegToken = 'app'

export const AppConfig = registerAs(appRegToken, () => ({
    name: env('app.name', 'NestJS'),
    port: envNumber('app.port', 5000),
    base_url: env('app.base_url', 'http://localhost:5000'),
    locale: env('app.locale', 'ru-RU'),
}))

export type IAppConfig = ConfigType<typeof AppConfig>
