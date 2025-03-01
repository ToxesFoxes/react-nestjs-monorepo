import { ConfigType, registerAs } from '@nestjs/config'
import { env, envBoolean, envNumber } from '../helpers'

export const globalRegToken = 'global'

export const GlobalConfig = registerAs(globalRegToken, () => ({
    prefix: env('global.prefix', 'api')
}))

export type IGlobalConfig = ConfigType<typeof GlobalConfig>
