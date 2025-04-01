import { SecretStorage } from "vscode"



export class TenantService {
    constructor(private storage: SecretStorage) {
    }

    public async get(id: string): Promise<string | undefined> {
        return await this.storage.get(id)
    }

    public async addOrUpdate(id: string, apiKey: string) {
        await this.storage.store(
            id,
            apiKey
        )
    }

    public async remove(id: string): Promise<void> {
        await this.storage.delete(id)
    }
}