import * as fs from 'fs';
import { AxiosInstance } from 'axios';
import { Connector, CreateConnectorRequest, CreateConnectorResponse, LogEvents, LogMessage, LogRequest, UpdateConnectorRequest, UpdateConnectorResponse, UploadConnectorResponse, } from '../models/API';
import { compareCaseInsensitive } from '../utils/compare';
import { basename } from 'path';

export class SaaSConnectivityClient {
    constructor(private readonly axios: AxiosInstance) { }

    public async getConnectors(): Promise<Connector[]> {
        const response = await this.axios.get<Connector[]>("platform-connectors")
        return response.data.sort((a, b) => compareCaseInsensitive(a, b, "alias"))
    }

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

    public async uploadConnector(id: string, filePath: string):Promise<UploadConnectorResponse> {
        const fileBuffer = await fs.readFileSync(filePath);

        // Create a File object
        const file = new File([fileBuffer], basename(filePath), {
            type: "application/zip"
        })
        const response = await this.axios.post<UploadConnectorResponse>(`platform-connectors/${id}/versions`, file)
        return response.data
    }
}