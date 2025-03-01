import { readFileSync } from 'fs'
import { load } from 'js-yaml'
import { resolveEnvPath } from '@toxesfoxes/env-resolver'
import { ROOT_DIR } from '../../paths'

export const envFilePath = resolveEnvPath(ROOT_DIR, false, [
    { value: '.env', type: 'filename' },
    { value: '.$1', type: 'node_env', optional: true },
    { value: '.yaml', type: 'filename' },
])

export function loadYaml(): any {
    const file = readFileSync(envFilePath, 'utf8')
    return load(file)
}