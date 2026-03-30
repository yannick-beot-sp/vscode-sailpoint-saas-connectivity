import type { ConnectorAction, ConnectorConfig, ConnectorResponse, ConnectorSource, LocalAction, Target } from '../types';
import type { ConnectorClient } from './Client';
import * as commands from './Commands';
import { messageHandler } from './MessageHandler';

export class VsCodeClient implements ConnectorClient {

  async getSources(): Promise<ConnectorSource[]> {
    const result = await messageHandler.request<ConnectorSource[] | null>(commands.GET_SOURCES);
    return result ?? [];
  }

  async getLocalActions(port: number): Promise<LocalAction[]> {
    const result = await messageHandler.request<LocalAction[] | null>(
      commands.GET_LOCAL_ACTIONS,
      { port }
    );
    return result ?? [];
  }

  async executeLocalAction(port: number, action: string, payload: any): Promise<ConnectorResponse> {
    return messageHandler.request<ConnectorResponse>(
      commands.EXECUTE_LOCAL_ACTION,
      { port, action, body: payload }
    );
  }

  async getTenantActions(sourceId: string): Promise<ConnectorAction[]> {
    const result = await messageHandler.request<ConnectorAction[] | null>(
      commands.GET_TENANT_ACTIONS,
      { sourceId }
    );
    return result ?? [];
  }

  async executeTenantAction(sourceId: string, action: string, payload: any): Promise<ConnectorResponse> {
    return messageHandler.request<ConnectorResponse>(
      commands.EXECUTE_TENANT_ACTION,
      { sourceId, action, body: payload }
    );
  }

  async syncConfig(target: Target): Promise<ConnectorConfig> {
    const result = await messageHandler.request<ConnectorConfig | null>(
      commands.SYNC_CONFIG,
      { target }
    );
    return result ?? {};
  }
}
