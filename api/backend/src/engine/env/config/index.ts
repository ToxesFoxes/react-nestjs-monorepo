import { AppConfig, appRegToken, IAppConfig } from './app.config'
import { GlobalConfig, globalRegToken, IGlobalConfig } from './global.config'
import { SwaggerConfig, swaggerRegToken, ISwaggerConfig } from './swagger.config'

export * from './app.config'

export interface AllConfigType {
    [appRegToken]: IAppConfig
    [globalRegToken]: IGlobalConfig
    [swaggerRegToken]: ISwaggerConfig
}

export type ConfigKeyPaths = RecordNamePaths<AllConfigType>

export default {
    AppConfig,
    GlobalConfig,
    SwaggerConfig,
}
