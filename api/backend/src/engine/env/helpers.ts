import { loadYaml } from '.'

export const isDev = process.env.NODE_ENV === 'development'

export type BaseType = boolean | number | string | object | undefined | null

const yamlConfig = loadYaml()

function formatValue<T extends BaseType = string>(key: string, defaultValue: T, callback?: (value: any) => T): T {
    const value = key.split('.').reduce((obj: any, key) => obj?.[key], yamlConfig)
    if (typeof value === 'undefined')
        return defaultValue

    if (!callback)
        return value as T

    return callback(value)
}

export function env(key: string, defaultValue: string = '') {
    return formatValue(key, defaultValue)
}

export function envString(key: string, defaultValue: string = '') {
    return formatValue(key, defaultValue)
}

export function envNumber(key: string, defaultValue: number = 0) {
    return formatValue(key, defaultValue, (value) => {
        if (typeof value !== 'number')
            throw new Error(`${key} config value is not a number`)
        return value
    })
}

export function envBoolean(key: string, defaultValue: boolean = false) {
    return formatValue(key, defaultValue, (value) => {
        if (typeof value !== 'boolean')
            throw new Error(`${key} config value is not a boolean`)
        return value
    })
}

export function envJson(key: string, defaultValue: object = {}) {
    return formatValue(key, defaultValue, (value) => {
        if (typeof value !== 'object')
            throw new Error(`${key} config value is not an object`)
        return value
    })
}
