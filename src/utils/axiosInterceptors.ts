import { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig, isAxiosError } from "axios";
import { Logger } from "./Logger";

export const onRequest = (request: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {

    const method = request.method?.toUpperCase();
    const url = request.url;
    const body = typeof request.data === 'object' ? JSON.stringify(request.data) : request.data;
    Logger.trace(`REQUEST: ${method} ${url}`, body);
    return request;
};

export const onResponse = (response: AxiosResponse): AxiosResponse => {

    const status = response.status;
    const isStream = response.config?.responseType === 'stream';
    const body = isStream ? '[stream]' : (typeof response.data === 'object' ? JSON.stringify(response.data) : response.data);
    Logger.trace(`RESPONSE: ${status}`, body);
    return response;
};

export const onErrorResponse = async (error: AxiosError | Error) => {

    let errorMessage = '';
    if (isAxiosError(error)) {
        let { message } = error;
        const { method, url, responseType } = error.config as AxiosRequestConfig;
        let { status, data } = error.response as AxiosResponse ?? {};
        const isStream = responseType === 'stream';
        let body = ""
        if (isStream) {
            for await (const chunk of data) {
                body += chunk.toString();
            }
            try {
                data = JSON.parse(body);
            } catch (e) {}
        } else {
            body = JSON.stringify(data)
        }

        Logger.error(
            error, `${method?.toUpperCase()} ${url} | Error ${status} ${message} | ${body}`
        );

        if (typeof data === "object" && data !== undefined && "messages" in data) {
            errorMessage = data.messages[0].text
        } else {
            errorMessage = message
        }

    } else {
        const caller = (new Error()).stack?.split("\n")[2].trim().split(" ")[1];
        Logger.error(error, `${caller?.toUpperCase()} ${error.message}`);
        errorMessage = error.message;
    }
    return Promise.reject(new Error(errorMessage));
};