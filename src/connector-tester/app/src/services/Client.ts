import type { ConnectorAction, ConnectorConfig, ConnectorResponse, ConnectorSource, LocalAction, Target } from '../types';

export interface ConnectorClient {
  getSources(): Promise<ConnectorSource[]>;

  getLocalActions(port: number): Promise<LocalAction[]>;
  executeLocalAction(port: number, action: string, payload: any): Promise<ConnectorResponse>;

  getTenantActions(sourceId: string): Promise<ConnectorAction[]>;
  executeTenantAction(sourceId: string, action: string, payload: any): Promise<ConnectorResponse>;

  syncConfig(target: Target): Promise<ConnectorConfig>;
}
