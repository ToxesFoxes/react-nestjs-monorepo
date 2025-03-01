import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { envFilePath } from './engine/env'
import config from './engine/env/config'

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath,
            isGlobal: true,
            expandVariables: true,
            load: [...Object.values(config)],
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
