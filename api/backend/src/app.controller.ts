import { Controller } from '@nestjs/common'
import { AppService } from './app.service'
import { Get } from '@tfs/custom-router'
import { Swagger } from '@tfs/swagger'

Swagger.DynamicConfig.addTag('App', 'App controller')

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }

    @Get()
    getHello(): string {
        return this.appService.getHello()
    }
}
