import {
    applyDecorators, CanActivate, ExceptionFilter, NestInterceptor, PipeTransform, RequestMapping,
    RequestMappingMetadata, RequestMethod, UseFilters, UseGuards, UseInterceptors, UsePipes
} from '@nestjs/common'
import {
    ApiBody, ApiBodyOptions, ApiConsumes, ApiOperation, ApiParam, ApiParamOptions, ApiQuery,
    ApiQueryOptions, ApiResponse, ApiResponseMetadata, ApiResponseSchemaHost, ApiTags
} from '@nestjs/swagger'

export type RouteResponse = Omit<ApiResponseMetadata, 'status'> | Omit<ApiResponseSchemaHost, 'status'>
export type RouteResponses = {
    [status: number | string]: RouteResponse
}

export type RouteDescription = {
    /**
     * Тип запроса
     * @default get
     * @example post
     * @see RequestMethod
     */
    type?: RequestMappingMetadata['method']
    /**
     * Краткое описание роута для документации Swagger
     * @example Получить информацию о пользователе
     */
    summary?: string
    /**
     * Полное описание роута для документации Swagger
     * @example Этот роут используется для получения информации о пользователе
     */
    description?: string | string[]
    /**
     * Теги для документации Swagger
     * @example Пользователи
     */
    tags?: string[]
    /**
     * Защита роута
     * @example [AuthGuard]
     */
    guards?: (Function | CanActivate)[]
    /**
     * Пайпы для валидации данных
     * @example [new ValidationPipe()]
     * @see https://docs.nestjs.com/pipes
     */
    pipes?: (PipeTransform | Function)[]
    /**
     * Фильтры исключений
     * @example [new Exceptor()]
     * @description Необходимо добавлять в контроллере
     * @see Exceptor
     * @see https://docs.nestjs.com/exception-filters
     */
    filters?: (Function | ExceptionFilter<any>)[]
    /**
     * Интерсепторы
     * @example [new DataInterceptor()]
     * @description Необходимо добавлять в контроллере
     * @see DataInterceptor
     * @see https://docs.nestjs.com/interceptors
     */
    interceptors?: (Function | NestInterceptor<any, any>)[]
    /**
     * Типы запросов, которые может обрабатывать роут
     * @example ['application/json', 'multipart/form-data]
     */
    consumes?: string[]
    /**
     * Свойства для документации Swagger
     * @see https://docs.nestjs.com/openapi/types-and-parameters
     */
    swaggerOptions?: {
        param?: ApiParamOptions[]
        query?: ApiQueryOptions[]
        body?: ApiBodyOptions[]
    }
}

export function Route(
    path: RequestMappingMetadata['path'] = '',
    route: RouteDescription = {},
    responses: RouteResponses = {},
) {
    const decorators = []
    const apply = (...decorator: any[]) => decorators.push(...decorator)

    //#region Route config
    const {
        type = 'get', summary, description,
        tags, pipes, guards, filters, interceptors, consumes,
        swaggerOptions
    } = route

    apply(RequestMapping({ path, method: type as RequestMethod }))

    if (!!tags) apply(ApiTags(...tags))
    if (!!pipes) apply(UsePipes(...pipes))
    if (!!summary) ApiOperation({
        summary, description: Array.isArray(description) ? description.join('<br>\n') : description
    })
    if (!!consumes) apply(ApiConsumes(...consumes))
    if (!!guards) apply(UseGuards(...guards))
    if (!!filters) apply(UseFilters(...filters))
    if (!!interceptors) apply(UseInterceptors(...interceptors))
    //#endregion

    //#region Route properties
    if (swaggerOptions) {
        const { query, body, param } = swaggerOptions
        if (query) for (const queryItem of query) apply(ApiQuery(queryItem))
        if (param) for (const paramItem of param) apply(ApiParam(paramItem))
        if (body) for (const bodyItem of body) apply(ApiBody(bodyItem))
    }
    //#endregion

    //#region Route responses
    for (const status in responses) {
        const response = responses[status]
        apply(ApiResponse({ status: Number(status), ...response }))
    }
    //#endregion

    return applyDecorators(...decorators)
}
