import { Bundle, HttpMethod, ZObject } from "zapier-platform-core";
const http = require("https");
import FormData = require("form-data");

import {
    MAX_ATTEMPTS,
    Operation,
    OperationToDomain,
    RETRY_DELAY,
} from "../constants/constants";
import { IncomingMessage } from "http";
import { URL, URLSearchParams } from "url";
import path = require("path");

interface DownloadResult {
    stream: IncomingMessage;
    fileName: string;
}

const getCommonHeaders = (
    bundle: Bundle,
    contentType: "json" | "form" = "json"
) => {
    const apiKey = bundle.authData.apiKey;
    return {
        "Content-Type":
            contentType === "json" ? "application/json" : "multipart/form-data",
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
    };
};

const getBaseUrl = (bundle: Bundle) => {
    return bundle.authData.baseUrl ? bundle.authData.baseUrl : 'https://api.vlm.run/v1';
}

const makeApiRequest = async (
    z: ZObject,
    url: string,
    method: HttpMethod,
    headers: any,
    body: any = {}
) => {
    try {
        const response = await z.request({
            method,
            url,
            headers,
            body: body instanceof FormData ? body : JSON.stringify(body),
            json: true,
        });

        return response.data;
    } catch (error: any) {
        throw new Error(`API request failed: ${error.message}`);
    }
};

const getDocumentResponseWithRetry = async (
    z: ZObject,
    bundle: Bundle,
    documentId: string
) => {
    let attempts = 0;
    while (attempts < MAX_ATTEMPTS) {
        z.console.log(`Getting document response, attempt : ${attempts}`);

        const documentResponse = await makeApiRequest(
            z,
            `${getBaseUrl(bundle)}/response/${documentId}`,
            "GET",
            getCommonHeaders(bundle, "json"),
            {}
        );

        z.console.log(`Response : `, documentResponse);

        if (documentResponse.status === "completed") {
            return documentResponse;
        } else {
            attempts++;
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        }
    }

    throw new Error("Document processing timed out");
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
    const fileResponse = await performFileUpload(z, bundle);

    // Step 2: Generate structured output
    const audioRequest = {
        file_id: fileResponse.id,
        model: model,
        domain: OperationToDomain[operation],
        batch: false
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

const performFileUpload = async (z: ZObject, bundle: Bundle) => {
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
        return await performFileUpload(z, bundle);
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
        const fileResponse = await performFileUpload(z, bundle);

        // Step 2: Generate structured output
        const documentRequest = {
            file_id: fileResponse.id,
            model,
            batch: false
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
            model
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
    const fileResponse = await performFileUpload(z, bundle);

    // Step 2: Generate structured output
    const documentRequest = {
        file_id: fileResponse.id,
        model: model,
        domain: OperationToDomain[operation],
        batch: false
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

const makeDownloadStream = (url: string): Promise<DownloadResult> => {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        let fileName = path.basename(parsedUrl.pathname);

        if (!fileName || fileName === "/") {
            fileName = "downloaded_file";
        }

        http
            .request(url, (res: IncomingMessage) => {
                res.pause();

                // If Content-Disposition header is present, try to get filename from it
                const contentDisposition = res.headers["content-disposition"];
                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
                    if (filenameMatch) {
                        fileName = filenameMatch[1];
                    }
                }

                // If we still don't have a file extension, try to add one based on Content-Type
                if (!path.extname(fileName)) {
                    const contentType = res.headers["content-type"];
                    if (contentType) {
                        const ext = contentType.split("/").pop();
                        fileName += `.${ext}`;
                    }
                }

                resolve({ stream: res, fileName });
            })
            .on("error", reject)
            .end();
    });
};

const getMimeTypeAndBase64 = async (
    url: string
): Promise<{ mimeType: string; base64: string }> => {
    try {
        const { stream } = await makeDownloadStream(url);
        const mimeType =
            stream.headers["content-type"] || "application/octet-stream";

        return new Promise((resolve, reject) => {
            let data = "";
            stream.setEncoding("base64");

            stream.on("data", (chunk: Buffer) => {
                data += chunk;
            });

            stream.on("end", () => {
                resolve({
                    mimeType,
                    base64: data,
                });
            });

            stream.on("error", (error: Error) => {
                reject(error);
            });

            stream.resume();
        });
    } catch (error: any) {
        throw new Error(
            `Failed to download and process the file: ${error.message}`
        );
    }
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
        throw new Error(`File upload failed: ${error.message}`);
    }
};