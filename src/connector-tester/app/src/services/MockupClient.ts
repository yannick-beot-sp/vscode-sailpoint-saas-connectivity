import type { CallHistoryItem, ConnectorConfig, ConnectorItem, ConnectorResponse, ConnectorSource, EnvFile, Target } from '../types';
import type { ConnectorClient } from './Client';

const MOCK_LOCAL_ACTIONS: string[] = [
  'std:account:list',
  'std:account:read',
  'std:entitlement:list',
  'std:entitlement:read',
  'std:test-connection',
  'std:account:update',
  'std:account:create',
  'std:account:delete',
  'std:account:disable',
  'std:account:enable',
  'std:account:unlock',
];

const MOCK_SOURCES: ConnectorSource[] = [
  { id: 'instance-entra-id', name: 'Entra ID Source' },
  { id: 'instance-2-id', name: 'LDAP Source' },
];

const MOCK_CONNECTORS: ConnectorItem[] = [
  { id: 'connector-entra-id', alias: 'Entra ID Connector' },
  { id: 'connector-ldap-id', alias: 'LDAP Connector' },
];

export class MockupClient implements ConnectorClient {

  async getSources(): Promise<ConnectorSource[]> {
    await delay(300);
    return MOCK_SOURCES;
  }

  async getConnectors(): Promise<ConnectorItem[]> {
    await delay(300);
    return MOCK_CONNECTORS;
  }

  async getEnvFiles(): Promise<EnvFile[]> {
    await delay(200);
    return [
      { name: '.env', path: '/workspace/.env' },
      { name: '.env.dev', path: '/workspace/.env.dev' },
    ];
  }

  async getLocalActions(): Promise<string[]> {
    await delay(400);
    return MOCK_LOCAL_ACTIONS;
  }

  async executeLocalAction(_port: number, action: string, payload: any, _config?: ConnectorConfig): Promise<ConnectorResponse> {
    await delay(600);
    if (action === 'std:test-connection') {
      return {
        status: 200,
        duration: 312,
        body: { message: 'Connection successful' },
      };
    }
    if (action === 'std:account:list' || action === 'std:entitlement:list') {
      const items = [
        { id: 'user1', name: 'Alice Example', email: 'alice@example.com' },
        { id: 'user2', name: 'Bob Example', email: 'bob@example.com' },
        { id: 'user3', name: 'Carol Example', email: 'carol@example.com' },
      ];
      return {
        status: 200,
        duration: 512,
        body: items.map(data => JSON.stringify({ data, type: 'output' })).join('\n') + '\n',
      };
    }
    return {
      status: 200,
      duration: 512,
      body: {
        requestedAction: action,
        requestedPayload: payload,
      },
    };
  }

  async getTenantActions(_connectorId: string): Promise<string[]> {
    await delay(300);
    return MOCK_LOCAL_ACTIONS;
  }

  async executeTenantAction(_connectorId: string, action: string, payload: any, _config?: ConnectorConfig): Promise<ConnectorResponse> {
    await delay(800);
    return {
      status: 200,
      duration: 750,
      body: { action, payload, result: 'mock tenant response' },
    };
  }

  async syncConfig(_target: Target, _envFilePath?: string, _sourceName?: string): Promise<ConnectorConfig> {
    await delay(500);
    return {
      clientId: 'mock-client-id',
      baseUrl: 'https://mock.example.com',
      timeout: 30000,
    };
  }

  async loadHistory(): Promise<CallHistoryItem[]> {
    return [];
  }

  async saveHistory(_items: CallHistoryItem[]): Promise<void> {}

  async deleteHistoryItem(_id: string): Promise<CallHistoryItem[]> {
    return [];
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
