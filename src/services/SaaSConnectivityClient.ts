import { AxiosInstance } from 'axios';
import { Connector, LogRequest, } from '../models/API';

export class SaaSConnectivityClient {
    constructor(private readonly axios: AxiosInstance) {

    }

    public async getConnectors(): Promise<Connector[]> {
        const response = await this.axios.get<Connector[]>("platform-connectors")
        return response.data
    }

    public async getLogs(input: LogRequest): Promise<void> {

    }




}