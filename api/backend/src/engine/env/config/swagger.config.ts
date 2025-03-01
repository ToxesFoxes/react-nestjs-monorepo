import { ConfigType, registerAs } from '@nestjs/config'
import { env, envBoolean, envJson } from '../helpers'

export const swaggerRegToken = 'swagger'

export const SwaggerConfig = registerAs(swaggerRegToken, () => ({
    enable: envBoolean('swagger.enable', true),
    protect: {
        enable: envBoolean('swagger.protect.enable', false),
        username: env('swagger.protect.username', 'admin'),
        password: env('swagger.protect.password', 'default'),
    },
    additional_servers: envJson('swagger.additional_servers', []),
}))

export type ISwaggerConfig = ConfigType<typeof SwaggerConfig>