import * as vscode from "vscode";

/**
 * Base class to expose getChildren and updateIcon methods
 */
export abstract class BaseTreeItem extends vscode.TreeItem {

	constructor(
		label: string | vscode.TreeItemLabel,
		public readonly tenantId: string,
		public readonly tenantName: string,
		public readonly tenantDisplayName: string,
		collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None,
	) {
		super(label, collapsibleState);
	}

	abstract getChildren(): Promise<BaseTreeItem[]>;

	reset(): void {
		// Do nothing by default
	}

	updateIcon(context: vscode.ExtensionContext) {
		// Do nothing by default
	}

	get computedContextValue(): string {
		return this.contextValue;
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
		private readonly isReadOnly:boolean
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
		const results: BaseTreeItem[] = [];
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
	) {
		super(label,
			undefined,
			undefined,
			undefined,
			vscode.TreeItemCollapsibleState.Collapsed);
		this.id = id
		this.resourceUri = vscode.Uri.parse(`${label}`)
	}

	contextValue = "folder"

	async getChildren(): Promise<BaseTreeItem[]> {
		// const children = this.tenantService.getChildren(this.id)
		// let results: BaseTreeItem[] = children?.map(x => convertToBaseTreeItem(x, this.tenantService)) ?? []
		// return results
        return []
	}
}
