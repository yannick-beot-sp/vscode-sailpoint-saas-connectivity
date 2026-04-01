import type { ConnectorConfig, ConnectorResponse, ConnectorSource, EnvFile, Target } from '../types';
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
  { id: 'source-entra-id', name: 'Entra' },
  { id: 'source-2-id', name: 'Source 2' },
];

export class MockupClient implements ConnectorClient {

  async getSources(): Promise<ConnectorSource[]> {
    await delay(300);
    return MOCK_SOURCES;
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
    return {
      status: 200,
      duration: 512,
      body: {
        items: [
          { id: 'user1', name: 'Alice Example', email: 'alice@example.com' },
          { id: 'user2', name: 'Bob Example', email: 'bob@example.com' },
        ],
        count: 2,
        requestedAction: action,
        requestedPayload: payload,
      },
    };
  }

  async getTenantActions(_sourceId: string): Promise<string[]> {
    await delay(300);
    return MOCK_LOCAL_ACTIONS;
  }

  async executeTenantAction(_sourceId: string, action: string, payload: any, _config?: ConnectorConfig): Promise<ConnectorResponse> {
    await delay(800);
    return {
      status: 200,
      duration: 750,
      body: { action, payload, result: 'mock tenant response' },
    };
  }

  async syncConfig(_target: Target, _envFilePath?: string): Promise<ConnectorConfig> {
    await delay(500);
    return {
      clientId: 'mock-client-id',
      baseUrl: 'https://mock.example.com',
      timeout: 30000,
    };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
