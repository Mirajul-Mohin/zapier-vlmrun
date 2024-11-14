import { Bundle } from "zapier-platform-core";
const http = require("https");
import { IncomingMessage } from "http";
import { URL } from "url";
import path = require("path");

interface DownloadResult {
    stream: IncomingMessage;
    fileName: string;
}

export const getMimeTypeAndBase64 = async (
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

export const makeDownloadStream = (url: string): Promise<DownloadResult> => {
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

export const getCommonHeaders = (
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

export const getBaseUrl = (bundle: Bundle) => {
    return bundle.authData.baseUrl ? bundle.authData.baseUrl : 'https://api.vlm.run/v1';
}