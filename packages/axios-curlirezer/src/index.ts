import { AxiosInstance, AxiosRequestConfig, CustomParamsSerializer, ParamsSerializerOptions } from 'axios'

export class CurlHelper {
    constructor(public request: AxiosRequestConfig) { }

    getHeaders() {
        let headers = this.request.headers
        let curlHeaders = []

        // get the headers concerning the appropriate method (defined in the global axios instance)
        if (headers.hasOwnProperty("common")) {
            headers = this.request.headers[this.request.method]
        }

        // add any custom headers (defined upon calling methods like .get(), .post(), etc.)
        for (let property in this.request.headers) {
            if (
                !["common", "delete", "get", "head", "patch", "post", "put"].includes(
                    property
                )
            ) {
                headers[property] = this.request.headers[property]
            }
        }

        for (let property in headers) {
            if ({}.hasOwnProperty.call(headers, property)) {
                let header = `${property}:${headers[property]}`
                curlHeaders.push(`-H "${header}"`)
            }
        }

        return curlHeaders.join(' \\\n').trim()
    }

    getMethod() {
        return `-X ${this.request.method.toUpperCase()}`
    }

    getBody() {
        if (
            typeof this.request.data !== "undefined" &&
            this.request.data !== "" &&
            this.request.data !== null &&
            this.request.method.toUpperCase() !== "GET"
        ) {
            let data = JSON.stringify(this.request.data)
            return `--data ${JSON.stringify(data)}`.trim()
        } else {
            return null
        }
    }

    getUrl() {
        if (this.request.baseURL) {
            let baseUrl = this.request.baseURL
            let url = this.request.url
            let finalUrl = baseUrl + "/" + url
            return finalUrl
                .replace(/\/{2,}/g, '/')
                .replace("http:/", "http://")
                .replace("https:/", "https://")
        }
        return this.request.url
    }

    getQueryString() {
        if (this.request.paramsSerializer) {
            const params = (this.request.paramsSerializer as ParamsSerializerOptions).serialize(this.request.params)
            if (!params || params.length === 0) return ''
            if (params.startsWith('?')) return params
            return `?${params}`
        }
        let params = ""
        let i = 0

        for (let param in this.request.params) {
            if ({}.hasOwnProperty.call(this.request.params, param)) {
                params +=
                    i !== 0
                        ? `&${param}=${this.request.params[param]}`
                        : `?${param}=${this.request.params[param]}`
                i++
            }
        }

        return params
    }

    getBuiltURL(encodeUri: boolean) {
        let url = this.getUrl()

        if (this.getQueryString() !== "") {
            url += this.getQueryString()
        }
        return encodeUri ? encodeURI(url.trim()) : url.trim()
    }

    generateCommand(encodeUri: boolean) {
        return [
            [
                'curl',
                this.getMethod(),
                `"${this.getBuiltURL(encodeUri).replace(/\$/g, '\\\$')}"`,
            ].join(' ').trim(),
            this.getHeaders(),
            this.getBody()
        ].filter(Boolean).join(' \\\n').trim()
    }
}
function defaultLogCallback(curlResult, err) {
    const { command } = curlResult
    if (err) {
        console.error(err)
    } else {
        console.info(command)
    }
}

export default (instance: AxiosInstance, callback = defaultLogCallback, encodeUri: boolean) => {
    instance.interceptors.request.use((req: any) => {
        try {
            const curl = new CurlHelper(req)
            req.curlObject = curl
            req.curlCommand = curl.generateCommand(encodeUri)
            req.clearCurl = () => {
                delete req.curlObject
                delete req.curlCommand
                delete req.clearCurl
            }
        } catch (err) {
            callback(null, err)
        } finally {
            if (req.curlirize !== false) {
                callback({
                    command: req.curlCommand,
                    object: req.curlObject
                }, null)
            }
            return req
        }
    })
}