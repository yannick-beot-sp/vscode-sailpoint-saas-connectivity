import * as vscode from "vscode";
import { ISCExtensionClient } from "../iscextension/iscextension-client";
import { SaaSConnectivityClientFactory } from "../services/SaaSConnectivityClientFactory";
import { convertToBaseTreeItem } from "../iscextension/convertToBaseTreeItem";

/**
 * Base class to expose getChildren and updateIcon methods
 */
export abstract class BaseTreeItem extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly tenantId: string,
        public readonly tenantName: string,
        public readonly tenantDisplayName: string,
        collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None,
    ) {
        super(label, collapsibleState);
    }

    getChildren(): Promise<BaseTreeItem[]> {
        throw new Error("Method not implemented.");
    }

    reset(): void {
        // Do nothing by default
    }

    updateIcon(context: vscode.ExtensionContext) {
        // Do nothing by default
    }

    get computedContextValue(): string {
        return this.contextValue!;
    }
}

/**
 * Containers for tenants
 */
export class TenantTreeItem extends BaseTreeItem {
    constructor(
        tenantLabel: string,
        tenantId: string,
        tenantName: string,
        tenantDisplayName: string,
        private readonly isReadOnly: boolean,
        private readonly iscExtensionClient: ISCExtensionClient
    ) {
        super(tenantLabel,
            tenantId,
            tenantName,
            tenantDisplayName,
            vscode.TreeItemCollapsibleState.Collapsed);
        this.tooltip = tenantName;
        this.id = tenantId
    }
    iconPath = new vscode.ThemeIcon("organization");
    contextValue = "tenant";

    async getChildren(): Promise<BaseTreeItem[]> {
        const results: BaseTreeItem[] = [
            new ConnectorsTreeItem(
                this.tenantId,
                this.tenantName,
                this.tenantDisplayName,
                this.iscExtensionClient),
            new SourcesTreeItem(
                this.tenantId,
                this.tenantName,
                this.tenantDisplayName,
                this.iscExtensionClient)
        ]
        return results
    }

    get computedContextValue() {
        return this.isReadOnly ? "tenantReadOnly" : "tenantWritable";
    }

}

/**
 * Folder for tenants
 */
export class TenantFolderTreeItem extends BaseTreeItem {
    constructor(
        id: string,
        label: string,
        private readonly iscExtensionClient: ISCExtensionClient
    ) {
        super(label,
            "n/a",
            "n/a",
            "n/a",
            vscode.TreeItemCollapsibleState.Collapsed);
        this.id = id
        this.resourceUri = vscode.Uri.parse(`${label}`)
    }

    contextValue = "folder"

    async getChildren(): Promise<BaseTreeItem[]> {
        const children = this.iscExtensionClient.getChildren(this.id)
        let results: BaseTreeItem[] = children?.map(x => convertToBaseTreeItem(x, this.iscExtensionClient)) ?? []
        return results

    }
}



export abstract class SubFolderTreeItem extends BaseTreeItem {
    protected readonly iscExtensionClient: ISCExtensionClient
    constructor(args: {
        label: string,
        contextValue: string,
        tenantId: string,
        tenantName: string,
        tenantDisplayName: string
        iscExtensionClient: ISCExtensionClient
    }
    ) {
        super(args.label,
            args.tenantId,
            args.tenantName,
            args.tenantDisplayName,
            vscode.TreeItemCollapsibleState.Collapsed)
        this.contextValue = args.contextValue
        this.iscExtensionClient = args.iscExtensionClient
    }
    // collapsibleState is not updated. It's only for initial state.
    // Setting statically the icon
    iconPath = new vscode.ThemeIcon("folder");
}


/**
 * Containers for connectors
 */
export class ConnectorsTreeItem extends SubFolderTreeItem {
    private readonly factory: SaaSConnectivityClientFactory
    constructor(
        tenantId: string,
        tenantName: string,
        tenantDisplayName: string,
        iscExtensionClient: ISCExtensionClient
    ) {
        super({
            label: "Connectors",
            contextValue: "connectors",
            tenantId,
            tenantName,
            tenantDisplayName,
            iscExtensionClient
        });
        this.factory = new SaaSConnectivityClientFactory(iscExtensionClient)
    }

    async getChildren(): Promise<BaseTreeItem[]> {
        const client = await this.factory.getSaaSConnectivityClient(this.tenantId, this.tenantName)
        const list = await client.getConnectors()
        const results: BaseTreeItem[] = list.map(x => new ConnectorTreeItem(
            x.id,
            x.alias,
            this.tenantId,
            this.tenantName,
            this.tenantDisplayName,
            this.iscExtensionClient
        ))
        return results
    }

}

export class ConnectorTreeItem extends BaseTreeItem {
    constructor(
        readonly id: string,
        label: string,
        tenantId: string,
        tenantName: string,
        tenantDisplayName: string,
        iscExtensionClient: ISCExtensionClient
    ) {
        super(label, tenantId, tenantName, tenantDisplayName);
    }
    
    contextValue = "connector"
}

/**
 * Containers for Sources
 */
export class SourcesTreeItem extends SubFolderTreeItem {
    private readonly factory: SaaSConnectivityClientFactory
    constructor(
        tenantId: string,
        tenantName: string,
        tenantDisplayName: string,
        iscExtensionClient: ISCExtensionClient
    ) {
        super({
            label: "SaaS Sources",
            contextValue: "sources",
            tenantId,
            tenantName,
            tenantDisplayName,
            iscExtensionClient
        });
        this.factory = new SaaSConnectivityClientFactory(iscExtensionClient)
    }

    async getChildren(): Promise<BaseTreeItem[]> {
        const client = await this.factory.getSaaSConnectivityClient(this.tenantId, this.tenantName)
        const list = await client.getInstances()

        const results: BaseTreeItem[] = list
            .map(x => new SourceTreeItem(
                x.id!,
                x.name,
                this.tenantId,
                this.tenantName,
                this.tenantDisplayName,
                this.iscExtensionClient
            ))
        return results
    }

}

export class SourceTreeItem extends BaseTreeItem {
    constructor(
        readonly id: string,
        label: string,
        tenantId: string,
        tenantName: string,
        tenantDisplayName: string,
        iscExtensionClient: ISCExtensionClient
    ) {
        super(label, tenantId, tenantName, tenantDisplayName);
    }

    public get logStreamLabel(): string {
        return `${this.tenantDisplayName}/${this.label}`;
    }

    public get logStreamPath(): string {
        return `sources/${encodeURIComponent(this.label)}`;
    }
    contextValue = "source"
}