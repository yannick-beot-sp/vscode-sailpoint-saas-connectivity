import { AxiosInstance } from 'axios';
import { Source } from '../models/ISCAPI';


export class ISCClient {

    constructor(private readonly tenantId: string, private readonly axios: AxiosInstance) { }




    public async getSourceByName(name: string): Promise<Source | undefined> {
        const response = await this.axios.get<Source[]>("sources", {
            params:
            {
                limit: 1,
                filters: `name eq "${name}"`
            }
        })
        if (response.data && Array.isArray(response.data) && response.data.length === 1) {
            return response.data[0]
        }

        return undefined
    }
}