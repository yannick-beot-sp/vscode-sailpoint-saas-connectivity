import axios from "axios";
import { NERMClient } from "./NERMClient";
import { TenantService } from "./TenantService";
import { TreeService } from "./TreeService";
import { onErrorResponse, onRequest, onResponse } from "../utils/axiosInterceptors";

export type GetClientRequest = { tenantId: string } | { baseUrl: string, token: string }

export class NERMClientFactory {
    constructor(
        private readonly treeService: TreeService,
        private readonly tenantService: TenantService) { }


    public async getClient(params: GetClientRequest): Promise<NERMClient> {
        // Polymorphism is hard...
        let baseUrl: string | undefined, token: string | undefined
        if ("tenantId" in params) {
            const tenantId = params.tenantId
            const config = this.treeService.get(tenantId)
            baseUrl = config?.baseUrl
            token = await this.tenantService.get(tenantId)
            if (baseUrl === baseUrl || token === undefined) {
                throw new Error(`Invalid tenant ID ${tenantId}`);
            }
        } else {
            baseUrl = params.baseUrl
            token = params.token
        }

        const instance = axios.create({
            baseURL: baseUrl,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        instance.defaults.headers.post['Content-Type'] = 'application/json';

        instance.interceptors.request.use(
            onRequest);
        instance.interceptors.response.use(
            onResponse,
            onErrorResponse
        );

        return new NERMClient(instance)
    }
}