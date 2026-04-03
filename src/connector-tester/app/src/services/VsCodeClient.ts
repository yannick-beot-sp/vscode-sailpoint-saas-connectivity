import type { CallHistoryItem, ConnectorConfig, ConnectorItem, ConnectorResponse, ConnectorSource, EnvFile, Target } from '../types';
import type { ConnectorClient } from './Client';
import * as commands from './Commands';
import { messageHandler } from './MessageHandler';

export class VsCodeClient implements ConnectorClient {

  async getSources(): Promise<ConnectorSource[]> {
    const result = await messageHandler.request<ConnectorSource[] | null>(commands.GET_SOURCES);
    return result ?? [];
  }

  async getConnectors(): Promise<ConnectorItem[]> {
    const result = await messageHandler.request<ConnectorItem[] | null>(commands.GET_CONNECTORS);
    return result ?? [];
  }

  async getEnvFiles(): Promise<EnvFile[]> {
    const result = await messageHandler.request<EnvFile[] | null>(commands.GET_ENV_FILES);
    return result ?? [];
  }

  async getLocalActions(): Promise<string[]> {
    const result = await messageHandler.request<string[] | null>(
      commands.GET_LOCAL_ACTIONS
    );
    return result ?? [];
  }

  async executeLocalAction(port: number, action: string, payload: any, config?: ConnectorConfig): Promise<ConnectorResponse> {
    return messageHandler.request<ConnectorResponse>(
      commands.EXECUTE_LOCAL_ACTION,
      { port, action, body: payload, config }
    );
  }

  async getTenantActions(connectorId: string): Promise<string[]> {
    const result = await messageHandler.request<string[] | null>(
      commands.GET_TENANT_ACTIONS,
      { connectorId }
    );
    return result ?? [];
  }

  async executeTenantAction(connectorId: string, action: string, payload: any, config?: ConnectorConfig): Promise<ConnectorResponse> {
    return messageHandler.request<ConnectorResponse>(
      commands.EXECUTE_TENANT_ACTION,
      { connectorId, action, body: payload, config }
    );
  }

  async syncConfig(target: Target, envFilePath?: string, sourceName?: string): Promise<ConnectorConfig> {
    const result = await messageHandler.request<ConnectorConfig | null>(
      commands.SYNC_CONFIG,
      { target, envFilePath, sourceName }
    );
    return result ?? {};
  }

  async loadHistory(): Promise<CallHistoryItem[]> {
    const result = await messageHandler.request<CallHistoryItem[] | null>(commands.LOAD_HISTORY);
    return result ?? [];
  }

  async saveHistory(items: CallHistoryItem[]): Promise<void> {
    await messageHandler.request<{ ok: boolean }>(commands.SAVE_HISTORY, { items });
  }

  async deleteHistoryItem(id: string): Promise<CallHistoryItem[]> {
    const result = await messageHandler.request<CallHistoryItem[] | null>(commands.DELETE_HISTORY_ITEM, { id });
    return result ?? [];
  }
}
