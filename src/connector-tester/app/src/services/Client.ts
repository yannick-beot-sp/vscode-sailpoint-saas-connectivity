import type { CallHistoryItem, ConnectorConfig, ConnectorItem, ConnectorResponse, ConnectorSource, EnvFile, Target } from '../types';

export interface ConnectorClient {
  getSources(): Promise<ConnectorSource[]>;
  getConnectors(): Promise<ConnectorItem[]>;
  getEnvFiles(): Promise<EnvFile[]>;

  getLocalActions(): Promise<string[]>;
  executeLocalAction(port: number, action: string, payload: any, config?: ConnectorConfig): Promise<ConnectorResponse>;

  getTenantActions(connectorId: string): Promise<string[]>;
  executeTenantAction(connectorId: string, action: string, payload: any, config?: ConnectorConfig): Promise<ConnectorResponse>;

  syncConfig(target: Target, envFilePath?: string, sourceName?: string): Promise<ConnectorConfig>;

  loadHistory(): Promise<CallHistoryItem[]>;
  saveHistory(items: CallHistoryItem[]): Promise<void>;
  deleteHistoryItem(id: string): Promise<CallHistoryItem[]>;
}
