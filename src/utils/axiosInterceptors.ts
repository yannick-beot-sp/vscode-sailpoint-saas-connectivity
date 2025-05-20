import { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig, isAxiosError } from "axios";



export const onRequest = (request: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {

    const method = request.method?.toUpperCase();
    const url = request.url;
    const body = typeof request.data === 'object' ? JSON.stringify(request.data) : request.data;
    console.log(`REQUEST: ${method} ${url} ${body}`);
    return request;
};

export const onResponse = (response: AxiosResponse): AxiosResponse => {

    const status = response.status;
    const body = typeof response.data === 'object' ? JSON.stringify(response.data) : response.data;
    console.log(`RESPONSE: ${status} ${body}`);
    return response;
};

export const onErrorResponse = async (error: AxiosError | Error) => {

    let errorMessage = '';
    if (isAxiosError(error)) {
        let { message } = error;
        const { method, url } = error.config as AxiosRequestConfig;
        const { statusText, status, data } = error.response as AxiosResponse ?? {};

        console.error(
            `[SaaSClient] ${method?.toUpperCase()} ${url} | Error ${status} ${message} | ${JSON.stringify(data)}`, error
        );


        if (typeof data === "object" && data !== undefined && "messages" in data) {
            errorMessage = data.messages[0].text
        } else {
            errorMessage = message
        }

    } else {
        const caller = (new Error()).stack?.split("\n")[2].trim().split(" ")[1];
        console.error(`[SaaSClient] ${caller?.toUpperCase()} ${error.message}`, error);
        errorMessage = error.message;
    }
    return Promise.reject(new Error(errorMessage));
};