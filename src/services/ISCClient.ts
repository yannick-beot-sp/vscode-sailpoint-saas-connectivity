
import { AxiosInstance } from "axios";
import { Configuration, Paginator, Source, SourcesApi } from "sailpoint-api-client";

export class ISCClient {
    constructor(private readonly apiConfig: Configuration, private readonly instance: AxiosInstance) {

    }

    public async getSources(): Promise<Source[]> {
        console.log("> getSources");
        const apiConfig = this.apiConfig;
        const api = new SourcesApi(apiConfig, undefined, this.instance)
        const result = await Paginator.paginate(api, api.listSources, { sorters: "name" });
        return result.data;
    }

}