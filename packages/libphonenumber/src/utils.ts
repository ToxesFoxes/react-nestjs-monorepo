import { PhoneNumberUtil } from 'google-libphonenumber'

export const phoneUtil = PhoneNumberUtil.getInstance()

export const tryParse = (value: string) => {
    try {
        return phoneUtil.parse(value)
    } catch (e) {
        return null
    }
}

export const isValidPhoneNumber = (value?: string | null) => {
    if (!value) return false
    let parsed = tryParse(value)
    if (parsed === null) return false
    return phoneUtil.isValidNumber(parsed)
}

export const parseNumberIntoParts = (number: string) => {
    try {
        let parsed = phoneUtil.parse(number, 'KZ')
        let country_code = parsed.hasCountryCode() ? parsed.getCountryCode() : null
        let length = phoneUtil.getLengthOfGeographicalAreaCode(parsed) || 3
        const nationalNumber = parsed.getNationalNumber().toString()
        const operatorCode = nationalNumber.slice(0, length)
        const subscriberNumber = nationalNumber.slice(length)

        return {
            country_code: `+${country_code}`,
            operatorCode,
            subscriberNumber,
            format: {
                e164: phoneUtil.format(parsed, 0),
                international: phoneUtil.format(parsed, 1),
                national: phoneUtil.format(parsed, 2),
                rfc3966: phoneUtil.format(parsed, 3),
            },
            error: null,
            parsed,
        }
    } catch (error) {
        return {
            country_code: null,
            operatorCode: null,
            subscriberNumber: null,
            format: {
                e164: null,
                international: null,
                national: null,
                rfc3966: null,
            },
            error
        }
    }
}