import * as fs from 'fs';
import { AxiosInstance } from 'axios';
import { Connector, CreateConnectorRequest, CreateConnectorResponse, CreateCustomizerRequest, CreateCustomizerResponse, Customizer, GetInstancesResponse, Instance, LinkRequest, LinkResponse, LogEvents, LogMessage, LogRequest, UnlinkRequest, UnlinkResponse, UpdateConnectorRequest, UpdateConnectorResponse, UpdateCustomizerRequest, UpdateCustomizerResponse, UploadConnectorResponse, UploadCustomizerResponse, } from '../models/API';
import { compareByName, compareCaseInsensitive } from '../utils/compare';
import { basename } from 'path';


const sourceCache = new Map<string, Instance[]>()
const customizerCache = new Map<string, Customizer[]>()


export function clearCache() {
    sourceCache.clear()
    customizerCache.clear()
}

export class SaaSConnectivityClient {

    constructor(private readonly tenantId: string, private readonly axios: AxiosInstance) { }

    //#region Logs

    public async getLogs(input: LogRequest): Promise<LogEvents> {
        const response = await this.axios.post<LogEvents>("platform-logs/query", input)
        return response.data
    }

    public async *getAllLogs(input: LogRequest) {
        let nextToken = undefined
        do {
            input.nextToken = nextToken
            const response = await this.getLogs(input)
            if (response && response.logs) {
                for (const log of response.logs) {
                    yield log
                }
            }

            nextToken = response.nextToken
        } while (nextToken !== undefined)
    }

    //#endregion Logs

    //#region Connectors

    public async getConnectors(): Promise<Connector[]> {
        const response = await this.axios.get<Connector[]>("platform-connectors")
        return response.data.sort((a, b) => compareCaseInsensitive(a, b, "alias"))
    }

    public async createConnector(alias: string) {
        const input: CreateConnectorRequest = {
            alias
        }
        const response = await this.axios.post<CreateConnectorResponse>("platform-connectors", input)
        return response.data
    }

    /**
     * To change a connector's alias
     * @param id 
     * @param alias 
     * @returns 
    */
    public async updateConnector(id: string, alias: string) {
        const input: UpdateConnectorRequest = {
            alias
        }
        const response = await this.axios.put<UpdateConnectorResponse>(`platform-connectors/${id}`, input)
        return response.data
    }

    public async deleteConnector(id: string) {
        const response = await this.axios.delete(`platform-connectors/${id}`)
    }

    public async uploadConnector(id: string, filePath: string): Promise<UploadConnectorResponse> {
        const fileBuffer = await fs.readFileSync(filePath);

        // Create a File object
        const file = new File([fileBuffer], basename(filePath), {
            type: "application/zip"
        })
        const response = await this.axios.post<UploadConnectorResponse>(`platform-connectors/${id}/versions`, file)
        return response.data
    }

    /**
     * List source instances in your ISC Org
     * @returns 
    */
    public async getInstances(): Promise<GetInstancesResponse[]> {
        if (sourceCache.has(this.tenantId)) {
            console.log("sourceCache hit!", this.tenantId);
            return sourceCache.get(this.tenantId)!
        } else {
            console.log("sourceCache missed!", this.tenantId);
            const response = await this.axios.get<GetInstancesResponse[]>("connector-instances")
            const data = response.data.sort(compareByName)
            sourceCache.set(this.tenantId, data)
            return data
        }
    }

    //#endregion Connectors

    //#region Customizers

    public async getCustomizers(): Promise<Customizer[]> {
        if (customizerCache.has(this.tenantId)) {
            console.log("customizerCache hit!", this.tenantId);

            return customizerCache.get(this.tenantId)!
        } else {
            console.log("customizerCache missed!", this.tenantId);
            const response = await this.axios.get<Customizer[]>("connector-customizers")
            const data = response.data.sort(compareByName)
            customizerCache.set(this.tenantId, data)
            return data
        }
    }

    public async createCustomizer(name: string) {
        const input: CreateCustomizerRequest = {
            name
        }
        const response = await this.axios.post<CreateCustomizerResponse>("connector-customizers", input)
        return response.data
    }

    /**
     * To change a connector's alias
     * @param id 
     * @param name 
     * @returns 
     */
    public async updateCustomizer(id: string, name: string) {
        const input: UpdateCustomizerRequest = {
            name
        }
        const response = await this.axios.put<UpdateCustomizerResponse>(`connector-customizers/${id}`, input)
        return response.data
    }

    public async deleteCustomizer(id: string) {
        const response = await this.axios.delete(`connector-customizers/${id}`)
    }

    public async uploadCustomizer(id: string, filePath: string): Promise<UploadCustomizerResponse> {
        const fileBuffer = await fs.readFileSync(filePath);

        // Create a File object
        const file = new File([fileBuffer], basename(filePath), {
            type: "application/zip"
        })
        const response = await this.axios.post<UploadCustomizerResponse>(`connector-customizers/${id}/versions`, file)
        return response.data
    }

    //#endregion Customizers

    public async link(customizerId: string, instanceId: string): Promise<LinkResponse> {
        const request: LinkRequest = {
            "op": "replace",
            "path": "/connectorCustomizerId",
            "value": customizerId,
        }

        const response = await this.axios.patch<LinkResponse>(
            `connector-instances/${instanceId}`,
            [request])

        return response.data
    }

    public async unlink(instanceId: string): Promise<UnlinkResponse> {
        const request: UnlinkRequest = {
            "op": "remove",
            "path": "/connectorCustomizerId",
        }

        const response = await this.axios.patch<UnlinkResponse>(
            `connector-instances/${instanceId}`,
            [request])

        return response.data
    }

}