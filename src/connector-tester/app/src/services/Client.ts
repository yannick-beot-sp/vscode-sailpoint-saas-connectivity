import type { ConnectorConfig, ConnectorResponse, ConnectorSource, EnvFile, Target } from '../types';

export interface ConnectorClient {
  getSources(): Promise<ConnectorSource[]>;
  getEnvFiles(): Promise<EnvFile[]>;

  getLocalActions(): Promise<string[]>;
  executeLocalAction(port: number, action: string, payload: any, config?: ConnectorConfig): Promise<ConnectorResponse>;

  getTenantActions(sourceId: string): Promise<string[]>;
  executeTenantAction(sourceId: string, action: string, payload: any, config?: ConnectorConfig): Promise<ConnectorResponse>;

  syncConfig(target: Target, envFilePath?: string): Promise<ConnectorConfig>;
}
