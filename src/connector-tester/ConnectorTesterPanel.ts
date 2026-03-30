import * as vscode from 'vscode';
import axios from 'axios';
import * as commands from './commands';
import { SaaSConnectivityClientFactory } from '../services/SaaSConnectivityClientFactory';
import { ISCExtensionClient } from '../iscextension/iscextension-client';

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
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(
        extensionUri: vscode.Uri,
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
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'connector-tester', 'assets')]
            }
        );

        ConnectorTesterPanel.currentPanels.set(tenantId,
            new ConnectorTesterPanel(panel, extensionUri, tenantId, tenantName, tenantDisplayName, iscExtensionClient)
        );
    }

    private readonly _clientFactory: SaaSConnectivityClientFactory;

    private constructor(
        panel: vscode.WebviewPanel,
        extensionUri: vscode.Uri,
        private readonly tenantId: string,
        private readonly tenantName: string,
        private readonly tenantDisplayName: string,
        iscExtensionClient: ISCExtensionClient,
    ) {
        this._clientFactory = new SaaSConnectivityClientFactory(iscExtensionClient);
        this._panel = panel;
        this._extensionUri = extensionUri;

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
                case commands.GET_LOCAL_ACTIONS:
                    await this._handleGetLocalActions(requestId, payload.port);
                    return;
                case commands.EXECUTE_LOCAL_ACTION:
                    await this._handleExecuteLocalAction(requestId, payload);
                    return;
                case commands.GET_TENANT_ACTIONS:
                    await this._handleGetTenantActions(requestId, payload.sourceId);
                    return;
                case commands.EXECUTE_TENANT_ACTION:
                    await this._handleExecuteTenantAction(requestId, payload);
                    return;
                case commands.SYNC_CONFIG:
                    await this._handleSyncConfig(requestId, payload);
                    return;
            }
        }, null, this._disposables);
    }

    private async _handleGetSources(requestId: string) {
        try {
            const client = await this._clientFactory.getSaaSConnectivityClient(this.tenantId, this.tenantName);
            const instances = await client.getInstances();
            const sources = instances.map(i => ({ id: i.id, name: i.name }));
            this._reply(commands.GET_SOURCES, requestId, sources);
        } catch (e: any) {
            this._replyError(commands.GET_SOURCES, requestId, e.message);
        }
    }

    private async _handleGetLocalActions(requestId: string, port: number) {
        try {
            const response = await axios.get(`http://localhost:${port}/actions`, { timeout: 5000 });
            this._reply(commands.GET_LOCAL_ACTIONS, requestId, response.data);
        } catch (e: any) {
            this._replyError(commands.GET_LOCAL_ACTIONS, requestId, e.message);
        }
    }

    private async _handleExecuteLocalAction(requestId: string, payload: {
        port: number;
        action: string;
        body: any;
    }) {
        const start = Date.now();
        try {
            const response = await axios.post(
                `http://localhost:${payload.port}/execute`,
                { action: payload.action, payload: payload.body },
                { timeout: 30000 }
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
        // TODO: implement tenant actions via ISC API
        this._replyError(commands.GET_TENANT_ACTIONS, requestId, 'Tenant actions not yet implemented');
    }

    private async _handleExecuteTenantAction(requestId: string, _payload: any) {
        // TODO: implement tenant action execution via ISC API
        const start = Date.now();
        this._reply(commands.EXECUTE_TENANT_ACTION, requestId, {
            status: 0,
            duration: Date.now() - start,
            body: null,
            error: 'Tenant action execution not yet implemented',
        });
    }

    private async _handleSyncConfig(requestId: string, _payload: any) {
        // TODO: implement config sync
        this._reply(commands.SYNC_CONFIG, requestId, {});
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
            vscode.Uri.joinPath(this._extensionUri, 'connector-tester', 'assets', 'index.js')
        );
        const stylesUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'connector-tester', 'assets', 'index.css')
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
