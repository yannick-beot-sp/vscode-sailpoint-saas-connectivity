import type { ConnectorConfig, ConnectorResponse, ConnectorSource, EnvFile, Target } from '../types';
import type { ConnectorClient } from './Client';
import * as commands from './Commands';
import { messageHandler } from './MessageHandler';

export class VsCodeClient implements ConnectorClient {

  async getSources(): Promise<ConnectorSource[]> {
    const result = await messageHandler.request<ConnectorSource[] | null>(commands.GET_SOURCES);
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

  async getTenantActions(sourceId: string): Promise<string[]> {
    const result = await messageHandler.request<string[] | null>(
      commands.GET_TENANT_ACTIONS,
      { sourceId }
    );
    return result ?? [];
  }

  async executeTenantAction(sourceId: string, action: string, payload: any, config?: ConnectorConfig): Promise<ConnectorResponse> {
    return messageHandler.request<ConnectorResponse>(
      commands.EXECUTE_TENANT_ACTION,
      { sourceId, action, body: payload, config }
    );
  }

  async syncConfig(target: Target, envFilePath?: string): Promise<ConnectorConfig> {
    const result = await messageHandler.request<ConnectorConfig | null>(
      commands.SYNC_CONFIG,
      { target, envFilePath }
    );
    return result ?? {};
  }
}
