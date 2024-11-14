import { Bundle, HttpMethod, ZObject } from "zapier-platform-core";
const http = require("https");
import FormData = require("form-data");
import { getMimeTypeAndBase64, makeDownloadStream, getCommonHeaders, getBaseUrl } from "./utils";

import {
    Operation,
    OperationToDomain,
} from "../constants/constants";
import { URLSearchParams } from "url";
import path = require("path");

const makeApiRequest = async (
    z: ZObject,
    url: string,
    method: HttpMethod,
    headers: any,
    body: any = {}
) => {
    try {
        z.console.log(`URL: ${url}`);
        const response = await z.request({
            method,
            url,
            headers,
            body: body instanceof FormData ? body : JSON.stringify(body),
            json: true,
        });

        z.console.log(`Response: ${JSON.stringify(response.data)}`);

        return response.data;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

const uploadFile = async (z: ZObject, bundle: Bundle) => {
    const { stream, fileName } = await makeDownloadStream(bundle.inputData.file);

    const form = new FormData();
    form.append("file", stream, fileName);

    const headers = {
        Authorization: `Bearer ${bundle.authData.apiKey}`,
        ...form.getHeaders(),
    };

    const fileResponse = await makeApiRequest(
        z,
        `${getBaseUrl(bundle)}/files`,
        "POST",
        headers,
        form
    );
    stream.resume();

    return fileResponse;
};

const performImageOperation = async (z: ZObject, bundle: Bundle) => {
    const { mimeType, base64 } = await getMimeTypeAndBase64(
        bundle.inputData.file
    );
    const operation = bundle.inputData.operation;

    const headers = getCommonHeaders(bundle, "json");

    const imagePayload = {
        image: `data:${mimeType};base64,${base64}`,
        model: bundle.inputData.model,
        domain: OperationToDomain[operation],
        callback_url: z.generateCallbackUrl()
    };

    return await makeApiRequest(
        z,
        `${getBaseUrl(bundle)}/image/generate`,
        "POST",
        headers,
        imagePayload
    );
};

const performAudioOperation = async (z: ZObject, bundle: Bundle) => {
    const operation = bundle.inputData.operation;
    const model = bundle.inputData.model;

    // Step 1: Upload file
    const fileResponse = await uploadFile(z, bundle);

    // Step 2: Generate structured output
    const audioRequest = {
        file_id: fileResponse.id,
        model: model,
        domain: OperationToDomain[operation],
        batch: true,
        callback_url: z.generateCallbackUrl()
    };

    const audioResponse = await makeApiRequest(
        z,
        `${getBaseUrl(bundle)}/audio/generate`,
        "POST",
        getCommonHeaders(bundle, "json"),
        audioRequest
    );

    z.console.log("audioResponse: ", audioResponse);

    return audioResponse;
};

const performAgentOperation = async (z: ZObject, bundle: Bundle) => {
    const model = bundle.inputData.model;
    const operation = bundle.inputData.operation;
    const url = bundle.inputData.url;
    const mode = bundle.inputData.mode;

    const webpageRequest = {
        url: url,
        model: model,
        domain: OperationToDomain[operation],
        mode: mode,
        callback_url: z.generateCallbackUrl()
    };

    return await makeApiRequest(
        z,
        `${getBaseUrl(bundle)}/web/generate`,
        "POST",
        getCommonHeaders(bundle, "json"),
        webpageRequest
    );
};

const performFileHandleOperation = async (z: ZObject, bundle: Bundle) => {
    const { operation } = bundle.inputData;

    if (operation === Operation.FILE_UPLOAD) {
        return await uploadFile(z, bundle);
    } else if (operation === Operation.FILE_LIST) {
        const queryParams = new URLSearchParams({ skip: '0', limit: '10' });

        const url = `${getBaseUrl(bundle)}/files${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const headers = getCommonHeaders(bundle, "json");

        const fileList = await makeApiRequest(z, url, "GET", headers);

        return fileList.length > 0 ? { fileList: fileList } : { fileList: 'No file found' };
    }
}

const performExperimentalOperation = async (z: ZObject, bundle: Bundle) => {
    const { operation, model } = bundle.inputData;

    if (operation === Operation.DOCUMENT_EMBEDDING) {
        // Step 1: Upload file
        const fileResponse = await uploadFile(z, bundle);

        // Step 2: Generate structured output
        const documentRequest = {
            file_id: fileResponse.id,
            model,
            batch: true,
            callback_url: z.generateCallbackUrl()
        };

        return await makeApiRequest(
            z,
            `${getBaseUrl(bundle)}/experimental/document/embeddings`,
            "POST",
            getCommonHeaders(bundle, "json"),
            documentRequest
        );

    } else if (operation === Operation.IMAGE_EMBEDDING) {
        const { mimeType, base64 } = await getMimeTypeAndBase64(
            bundle.inputData.file
        );

        const imagePayload = {
            image: `data:${mimeType};base64,${base64}`,
            model,
            batch: true,
            callback_url: z.generateCallbackUrl()
        };

        return await makeApiRequest(
            z,
            `${getBaseUrl(bundle)}/experimental/image/embeddings`,
            "POST",
            getCommonHeaders(bundle, "json"),
            imagePayload
        );
    }
}

const performDocumentOperation = async (z: ZObject, bundle: Bundle) => {
    const operation = bundle.inputData.operation;
    const model = bundle.inputData.model;

    // Step 1: Upload file
    const fileResponse = await uploadFile(z, bundle);

    // Step 2: Generate structured output
    const documentRequest = {
        file_id: fileResponse.id,
        model: model,
        domain: OperationToDomain[operation],
        batch: true,
        callback_url: z.generateCallbackUrl()
    };

    const documentResponse = await makeApiRequest(
        z,
        `${getBaseUrl(bundle)}/document/generate`,
        "POST",
        getCommonHeaders(bundle, "json"),
        documentRequest
    );

    z.console.log("documentResponse: ", documentResponse);

    return documentResponse;
};

export const performOperation = async (z: ZObject, bundle: Bundle) => {
    try {
        const operation = bundle.inputData.operation;

        const validDocumentOperations = [
            Operation.RESUME_PARSER,
            Operation.INVOICE_PARSER,
            Operation.PRESENTATION_PARSER,
            Operation.FORM_FILLING,
        ];
        const validImageOperations = [
            Operation.IMAGE_CATALOGING,
            Operation.IMAGE_CAPTIONING,
        ];
        const validAgentOperations = [Operation.GITHUB_AGENT];
        const validAudioOperations = [Operation.AUDIO_TRANSCRIPTION];
        const validExperimentalOperations = [Operation.DOCUMENT_EMBEDDING, Operation.IMAGE_EMBEDDING];
        const validFileHandleOperations = [Operation.FILE_LIST, Operation.FILE_UPLOAD];

        if (validImageOperations.includes(operation)) {
            return await performImageOperation(z, bundle);
        } else if (validDocumentOperations.includes(operation)) {
            return await performDocumentOperation(z, bundle);
        } else if (validAgentOperations.includes(operation)) {
            return await performAgentOperation(z, bundle);
        } else if (validAudioOperations.includes(operation)) {
            return await performAudioOperation(z, bundle);
        } else if (validExperimentalOperations.includes(operation)) {
            return await performExperimentalOperation(z, bundle);
        } else if (validFileHandleOperations.includes(operation)) {
            return await performFileHandleOperation(z, bundle);
        }

        throw new Error(`Invalid operation: ${operation}`);
    } catch (error: any) {
        throw new Error(`Exception performing operation: ${error.message}`);
    }
};