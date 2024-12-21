import { RequestMappingMetadata, RequestMethod } from '@nestjs/common'
import { Route, RouteDescription, RouteResponses } from './utils'

export type RouteDescriptor = (path?: RequestMappingMetadata['path'], route?: RouteDescription, responses?: RouteResponses) => MethodDecorator

export const Get: RouteDescriptor = (path = '/', route = {}, responses = {}) =>
    Route(path, { ...route, type: RequestMethod.GET }, responses)

export const Post: RouteDescriptor = (path = '/', route = {}, responses = {}) =>
    Route(path, { ...route, type: RequestMethod.POST }, responses)

export const Put: RouteDescriptor = (path = '/', route = {}, responses = {}) =>
    Route(path, { ...route, type: RequestMethod.PUT }, responses)

export const Delete: RouteDescriptor = (path = '/', route = {}, responses = {}) =>
    Route(path, { ...route, type: RequestMethod.DELETE }, responses)

export const Patch: RouteDescriptor = (path = '/', route = {}, responses = {}) =>
    Route(path, { ...route, type: RequestMethod.PATCH }, responses)

export const All: RouteDescriptor = (path = '/', route = {}, responses = {}) =>
    Route(path, { ...route, type: RequestMethod.ALL }, responses)

export const Options: RouteDescriptor = (path = '/', route = {}, responses = {}) =>
    Route(path, { ...route, type: RequestMethod.OPTIONS }, responses)

export const Head: RouteDescriptor = (path = '/', route = {}, responses = {}) =>
    Route(path, { ...route, type: RequestMethod.HEAD }, responses)

export const Search: RouteDescriptor = (path = '/', route = {}, responses = {}) =>
    Route(path, { ...route, type: RequestMethod.SEARCH }, responses)
