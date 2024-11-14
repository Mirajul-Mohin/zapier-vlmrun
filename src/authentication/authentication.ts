import { Bundle, HttpRequestOptions, ZObject } from "zapier-platform-core";

const test = (z: ZObject, bundle: Bundle) => {
    const baseUrl = bundle.authData.baseUrl;
    const url = `${baseUrl}/models`;
    return z.request({ url: url });
}

const handleBadResponses = (response: any, z: ZObject, bundle: Bundle) => {
    if (response.status)
    if ([401, 403].includes(response.status)) {
        throw new z.errors.Error(
            response.data.detail,
            'AuthenticationError',
            response.status
        );
    } else if ([429, 503].includes(response.status)) {
        throw new z.errors.Error(
            'System is busy, please try again later.',
            'SystemBusyError',
            response.status
        );
    } else if (response.status >= 400 && response.status < 500) {
        throw new z.errors.Error(
            'Unexpected error, please contact support.',
            'UnexpectedError',
            response.status
        );
    }

    return response;
};

const includeApiKey = (request: HttpRequestOptions,
    z: ZObject,
    bundle: Bundle) => {
    if (bundle.authData.apiKey) {

        request.headers = request.headers || {};
        request.headers['Authorization'] = `Bearer ${bundle.authData.apiKey}`;
    }
    return request;
};

export default {
    config: {
        type: 'custom',
        fields: [
            {
                key: 'apiKey',
                label: 'API Key',
                type: 'password',
                required: true,
                helpText:
                    'Find the API Key provided by VLM Run',
            },
            {
                key: 'baseUrl',
                label: 'API Base Url',
                default: 'https://api.vlm.run/v1',
                required: true,
            },
        ],
        test,
    },
    befores: [includeApiKey],
    afters: [handleBadResponses],
};