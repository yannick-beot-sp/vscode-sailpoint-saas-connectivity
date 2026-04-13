import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as commands from './commands';
import { SaaSConnectivityClientFactory } from '../services/SaaSConnectivityClientFactory';
import { clearCache } from '../services/SaaSConnectivityClient';
import { ISCExtensionClient } from '../iscextension/iscextension-client';
import { getWorkspaceFolder } from '../utils/vsCodeHelpers';
import { parseEnvFile } from '../utils/envUtils';

interface CallHistoryItem {
    id: string;
    timestamp: string;
    request: { target: any; action: string; payload: any };
    response?: { status: number; duration: number; headers?: Record<string, string>; body: any; error?: string };
    config?: string;
}

const SYSTEM_CONFIG_PROPERTIES = new Set([
    'healthCheckTimeout', 'idnProxyType', 'connectionType',
    'recommendationStatus', 'deleteThresholdPercentage', 'spConnectorSpecId',
    'sourceConnected', 'slpt-source-diagnostics', 'cloudCacheUpdate',
    'templateApplication', 'healthy', 'cloudDisplayName', 'connectorName',
    'beforeProvisioningRule', 'since', 'status',
]);

/**
 * SailPoint Standard Commands for @sailpoint/connector-sdk v1.1.41
 */
enum StandardCommand {
    StdAccountCreate = "std:account:create",
    StdAccountDelete = "std:account:delete",
    StdAccountDisable = "std:account:disable",
    StdAccountDiscoverSchema = "std:account:discover-schema",
    StdAccountEnable = "std:account:enable",
    StdAccountList = "std:account:list",
    StdAccountRead = "std:account:read",
    StdAccountUnlock = "std:account:unlock",
    StdAccountUpdate = "std:account:update",
    StdAgentList = "std:agent:list",
    StdMachineIdentityList = "std:machine-identity:list",
    StdResourceList = "std:resource:list",
    StdAuthenticate = "std:authenticate",
    StdEntitlementList = "std:entitlement:list",
    StdEntitlementRead = "std:entitlement:read",
    StdSpecRead = "std:spec:read",
    StdTestConnection = "std:test-connection",
    StdChangePassword = "std:change-password",
    StdSourceDataDiscover = "std:source-data:discover",
    StdSourceDataRead = "std:source-data:read",
    StdConfigOptions = "std:config-options:read",
    StdApplicationDiscoveryList = "std:application-discovery:list",
    StdSsfStreamDiscover = "std:ssf-stream:discover",
    StdSsfStreamRead = "std:ssf-stream:read",
    StdSsfStreamCreate = "std:ssf-stream:create",
    StdSsfStreamUpdate = "std:ssf-stream:update",
    StdSsfStreamStatusUpdate = "std:ssf-stream:status-update",
    StdSsfStreamDelete = "std:ssf-stream:delete",
    StdSsfStreamVerify = "std:ssf-stream:verify",
    StdSsfStreamReplace = "std:ssf-stream:replace"
}

const AVAILABLE_COMMANDS = Object.values(StandardCommand).sort()

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export class ConnectorTesterPanel {

    public static currentPanels: Map<string, ConnectorTesterPanel> = new Map();
    public static readonly viewType = 'connectorTesterView';

    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];
    private readonly _clientFactory: SaaSConnectivityClientFactory;

    public static createOrShow(
        context: vscode.ExtensionContext,
        tenantId: string,
        tenantName: string,
        tenantDisplayName: string,
        iscExtensionClient: ISCExtensionClient,
    ) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (ConnectorTesterPanel.currentPanels.has(tenantId)) {
            ConnectorTesterPanel.currentPanels.get(tenantId)!._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            ConnectorTesterPanel.viewType,
            `Connector Tester — ${tenantDisplayName}`,
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'connector-tester', 'assets')]
            }
        );

        ConnectorTesterPanel.currentPanels.set(tenantId,
            new ConnectorTesterPanel(panel, context, tenantId, tenantName, tenantDisplayName, iscExtensionClient)
        );
    }

    private constructor(
        panel: vscode.WebviewPanel,
        private readonly _context: vscode.ExtensionContext,
        private readonly tenantId: string,
        private readonly tenantName: string,
        private readonly tenantDisplayName: string,
        private readonly _iscExtensionClient: ISCExtensionClient,
    ) {
        this._clientFactory = new SaaSConnectivityClientFactory(_iscExtensionClient);
        this._panel = panel;

        this._update();

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.onDidChangeViewState(() => {
            if (this._panel.visible) {
                this._update();
            }
        }, null, this._disposables);

        this._panel.webview.onDidReceiveMessage(async (message) => {
            const { command, requestId, payload } = message;
            switch (command) {
                case commands.GET_SOURCES:
                    await this._handleGetSources(requestId);
                    return;
                case commands.GET_CONNECTORS:
                    await this._handleGetConnectors(requestId);
                    return;
                case commands.GET_LOCAL_ACTIONS:
                    await this._handleGetLocalActions(requestId);
                    return;
                case commands.EXECUTE_LOCAL_ACTION:
                    await this._handleExecuteLocalAction(requestId, payload);
                    return;
                case commands.GET_TENANT_ACTIONS:
                    await this._handleGetTenantActions(requestId, payload.connectorId);
                    return;
                case commands.EXECUTE_TENANT_ACTION:
                    await this._handleExecuteTenantAction(requestId, payload.action,
                        payload.connectorId,
                        payload.body, payload.config);
                    return;
                case commands.SYNC_CONFIG:
                    await this._handleSyncConfig(requestId, payload);
                    return;
                case commands.GET_ENV_FILES:
                    await this._handleGetEnvFiles(requestId);
                    return;
                case commands.LOAD_HISTORY:
                    await this._handleLoadHistory(requestId);
                    return;
                case commands.SAVE_HISTORY:
                    await this._handleSaveHistory(requestId, payload);
                    return;
                case commands.DELETE_HISTORY_ITEM:
                    await this._handleDeleteHistoryItem(requestId, payload);
                    return;
            }
        }, null, this._disposables);
    }

    private async _handleGetSources(requestId: string) {
        try {
            const client = await this._clientFactory.getSaaSConnectivityClient(this.tenantId, this.tenantName);
            clearCache();
            const instances = await client.getInstances();
            const sources = instances.map(i => ({ id: i.id, name: i.name }));
            this._reply(commands.GET_SOURCES, requestId, sources);
        } catch (e: any) {
            this._replyError(commands.GET_SOURCES, requestId, e.message);
        }
    }

    private async _handleGetConnectors(requestId: string) {
        try {
            const client = await this._clientFactory.getSaaSConnectivityClient(this.tenantId, this.tenantName);
            const connectors = await client.getConnectors();
            this._reply(commands.GET_CONNECTORS, requestId, connectors.map(c => ({ id: c.id, alias: c.alias })));
        } catch (e: any) {
            this._replyError(commands.GET_CONNECTORS, requestId, e.message);
        }
    }

    private _getConnectorSpec(): any {
        const workspaceFolder = getWorkspaceFolder()
        console.log({ workspaceFolder });
        if (workspaceFolder === undefined) {
            throw new Error("No workspace found. Try to open the folder of your connector before testing.")
        }
        const connectorSpecPath = path.join(workspaceFolder, "connector-spec.json")
        console.log({ connectorSpecPath });
        let connectorSpecContent: string
        try {
            connectorSpecContent = fs.readFileSync(connectorSpecPath, { encoding: "utf8" })
        } catch (error) {
            console.error(error);
            throw new Error("Could not read `connector-spec.json`. Try to open the folder of your connector before testing.")
        }
        const connectorSpecJSON = JSON.parse(connectorSpecContent)
        return connectorSpecJSON
    }

    private async _handleGetLocalActions(requestId: string) {
        try {
            const connectorSpecJSON = this._getConnectorSpec()
            this._reply(commands.GET_LOCAL_ACTIONS, requestId, connectorSpecJSON.commands);
        } catch (e: any) {
            this._replyError(commands.GET_LOCAL_ACTIONS, requestId, e.message);
        }
    }

    private async _handleExecuteLocalAction(requestId: string, payload: {
        port: number;
        action: string;
        body: any;
        config?: Record<string, any>;
    }) {
        const start = Date.now();
        try {
            const response = await axios.post(
                `http://localhost:${payload.port}/`,
                { type: payload.action, config: payload.config ?? {}, input: payload.body },
            );
            this._reply(commands.EXECUTE_LOCAL_ACTION, requestId, {
                status: response.status,
                duration: Date.now() - start,
                headers: response.headers as Record<string, string>,
                body: response.data,
            });
        } catch (e: any) {
            const duration = Date.now() - start;
            const axiosResponse = (e as any).response;
            this._reply(commands.EXECUTE_LOCAL_ACTION, requestId, {
                status: axiosResponse?.status ?? 0,
                duration,
                headers: axiosResponse?.headers as Record<string, string> | undefined,
                body: axiosResponse?.data ?? null,
                error: e.message,
            });
        }
    }

    private async _handleGetTenantActions(requestId: string, _sourceId: string) {
        this._reply(commands.GET_TENANT_ACTIONS, requestId, AVAILABLE_COMMANDS);
    }

    private async _handleExecuteTenantAction(requestId: string, cmd: string, sourceId: string, input: any, config: any) {
        const start = Date.now();
        try {
            const client = await this._clientFactory.getSaaSConnectivityClient(this.tenantId, this.tenantName)
            const result = await client.invokeCommand(sourceId, cmd, input, config)
            this._reply(commands.EXECUTE_TENANT_ACTION, requestId, {
                status: 200,
                duration: Date.now() - start,
                body: result,
            });
        } catch (e: any) {
            const duration = Date.now() - start;
            const axiosResponse = (e as any).response;
            this._reply(commands.EXECUTE_TENANT_ACTION, requestId, {
                status: axiosResponse?.status ?? 0,
                duration,
                body: axiosResponse?.data ?? null,
                error: e.message,
            });
        }
    }

    private async _handleGetEnvFiles(requestId: string) {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            console.log({ workspaceFolder });
            if (!workspaceFolder) {
                this._reply(commands.GET_ENV_FILES, requestId, []);
                return;
            }
            const pattern = new vscode.RelativePattern(workspaceFolder, '.env*');
            const uris = await vscode.workspace.findFiles(pattern);
            const envFiles = uris.map(uri => ({
                name: path.basename(uri.fsPath),
                path: uri.fsPath,
            }));
            this._reply(commands.GET_ENV_FILES, requestId, envFiles);
        } catch (e: any) {
            this._replyError(commands.GET_ENV_FILES, requestId, e.message);
        }
    }

    private get _historyKey(): string {
        return `connectorTesterHistory_${this.tenantId}`;
    }

    private async _handleLoadHistory(requestId: string): Promise<void> {
        const items = this._context.workspaceState.get<CallHistoryItem[]>(this._historyKey, []);
        this._reply(commands.LOAD_HISTORY, requestId, items);
    }

    private async _handleSaveHistory(requestId: string, payload: { items: CallHistoryItem[] }): Promise<void> {
        try {
            await this._context.workspaceState.update(this._historyKey, payload.items.slice(0, 50));
            this._reply(commands.SAVE_HISTORY, requestId, { ok: true });
        } catch (e: any) {
            this._replyError(commands.SAVE_HISTORY, requestId, e.message);
        }
    }

    private async _handleDeleteHistoryItem(requestId: string, payload: { id: string }): Promise<void> {
        try {
            const current = this._context.workspaceState.get<CallHistoryItem[]>(this._historyKey, []);
            const updated = current.filter(item => item.id !== payload.id);
            await this._context.workspaceState.update(this._historyKey, updated);
            this._reply(commands.DELETE_HISTORY_ITEM, requestId, updated);
        } catch (e: any) {
            this._replyError(commands.DELETE_HISTORY_ITEM, requestId, e.message);
        }
    }

    private async _buildConfig(sourceName?: string, envFilePath?: string): Promise<Record<string, any>> {
        const config: Record<string, any> = {};

        // 1. Start with connector-spec.json defaults
        try {
            const spec = this._getConnectorSpec();
            const keys = this._extractSourceConfigKeys(spec.sourceConfig ?? []);
            for (const key of keys) {
                config[key] = spec.sourceConfigInitialValues?.[key] ?? null;
            }
        } catch {
            // no connector-spec.json in workspace — skip
        }

        // 2. Override with source attributes
        if (sourceName) {
            const attributes = await this._fetchSourceConnectorAttributes(sourceName);
            for (const [key, value] of Object.entries(attributes)) {
                if (!SYSTEM_CONFIG_PROPERTIES.has(key)) {
                    config[key] = value;
                }
            }
        }

        // 3. Override with env file values
        if (envFilePath) {
            const envValues = parseEnvFile(envFilePath);
            for (const key of Object.keys(config)) {
                if (key in envValues) {
                    config[key] = envValues[key];
                }
            }
        }

        return config;
    }

    private async _handleSyncConfig(requestId: string, payload: {
        envFilePath?: string;
        sourceName?: string;
    }) {
        try {
            const config = await this._buildConfig(payload.sourceName, payload.envFilePath);
            this._reply(commands.SYNC_CONFIG, requestId, config);
        } catch (e: any) {
            this._replyError(commands.SYNC_CONFIG, requestId, e.message);
        }
    }

    private _extractSourceConfigKeys(sourceConfig: any[]): string[] {
        const keys: string[] = [];
        const visit = (item: any) => {
            if (item.key) { keys.push(item.key); }
            if (Array.isArray(item.items)) { item.items.forEach(visit); }
        };
        sourceConfig.forEach(visit);
        return keys;
    }

    private async _fetchSourceConnectorAttributes(sourceName: string): Promise<Record<string, any>> {
        const client = await this._clientFactory.getISCClient(this.tenantId, this.tenantName)
        const source = await client.getSourceByName(sourceName)
        return source?.connectorAttributes ?? {}
    }



    private _reply(command: string, requestId: string, payload: any) {
        this._panel.webview.postMessage({ command, requestId, payload });
    }

    private _replyError(command: string, requestId: string, error: string) {
        this._panel.webview.postMessage({ command, requestId, payload: null, error });
    }

    public dispose() {
        ConnectorTesterPanel.currentPanels.delete(this.tenantId);
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) { x.dispose(); }
        }
    }

    private _update() {
        this._panel.title = `Connector Tester — ${this.tenantDisplayName}`;
        this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._context.extensionUri, 'connector-tester', 'assets', 'index.js')
        );
        const stylesUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._context.extensionUri, 'connector-tester', 'assets', 'index.css')
        );
        const nonce = getNonce();

        return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' ${webview.cspSource}; img-src 'self' data: ${webview.cspSource} https:; script-src 'nonce-${nonce}';">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Connector Tester</title>
    <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
    <link href="${stylesUri}" rel="stylesheet">
  </head>
  <body>
    <div id="app"></div>
    <script nonce="${nonce}">
      window.data=${JSON.stringify({
            tenantId: this.tenantId,
            tenantName: this.tenantName,
            tenantDisplayName: this.tenantDisplayName,
        })};
    </script>
  </body>
</html>`;
    }
}
