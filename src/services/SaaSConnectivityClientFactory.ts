import * as vscode from "vscode";
import * as os from 'os';
import axios from "axios";
import { SaaSConnectivityClient } from "./SaaSConnectivityClient";
import { onErrorResponse, onRequest, onResponse } from "../utils/axiosInterceptors";
import { ISCExtensionClient } from "../iscextension/iscextension-client";
import { EndpointUtils } from "../iscextension/EndpointUtils";
import { ISCClient } from "./ISCClient";


export const USER_AGENT_HEADER = "User-Agent";
const EXTENSION_VERSION = vscode.extensions.getExtension("yannick-beot-sp.vscode-sailpoint-identitynow")?.packageJSON.version
export const USER_AGENT = `VSCode/${EXTENSION_VERSION}/${vscode.version} (${os.type()} ${os.arch()} ${os.release()})`


export class SaaSConnectivityClientFactory {
    constructor(
        private readonly iscExtensionClient: ISCExtensionClient,
    ) { }

    public async getSaaSConnectivityClient(tenantId: string, tenantName: string): Promise<SaaSConnectivityClient> {

        const baseUrl = EndpointUtils.getBetaUrl(tenantName)
        const accessToken = await this.iscExtensionClient.getAccessToken(tenantId)

        const instance = axios.create({
            baseURL: baseUrl,
            headers: this.getDefaultHeaders(accessToken)
        });

        this.prepareAxiosInstance(instance)

        return new SaaSConnectivityClient(tenantId, instance)
    }

        public async getISCClient(tenantId: string, tenantName: string): Promise<ISCClient> {

        const baseUrl = EndpointUtils.getV2025Url(tenantName)
        const accessToken = await this.iscExtensionClient.getAccessToken(tenantId)

        const instance = axios.create({
            baseURL: baseUrl,
            headers: this.getDefaultHeaders(accessToken)
        });

        this.prepareAxiosInstance(instance)

        return new ISCClient(tenantId, instance)
    }

    /////////////////////////////////
    //#region Private methods
    /////////////////////////////////

    private getDefaultHeaders(token: string) {
        return {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            [USER_AGENT_HEADER]: USER_AGENT
        }
    }

    private prepareAxiosInstance(instance: axios.AxiosInstance) {
        instance.defaults.headers.post['Content-Type'] = 'application/json';

        instance.interceptors.request.use(
            onRequest);
        instance.interceptors.response.use(
            onResponse,
            onErrorResponse
        );
        return instance
    }
    /////////////////////////////////
    //#endregion Private methods
    /////////////////////////////////
}