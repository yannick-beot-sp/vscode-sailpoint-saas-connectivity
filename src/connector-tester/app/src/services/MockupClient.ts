import type { ConnectorAction, ConnectorConfig, ConnectorResponse, ConnectorSource, LocalAction, Target } from '../types';
import type { ConnectorClient } from './Client';

const MOCK_LOCAL_ACTIONS: LocalAction[] = [
  { name: 'std:account:list' },
  { name: 'std:account:read' },
  { name: 'std:entitlement:list' },
  { name: 'std:entitlement:read' },
  { name: 'std:test-connection' },
  { name: 'std:account:update' },
  { name: 'std:account:create' },
  { name: 'std:account:delete' },
  { name: 'std:account:disable' },
  { name: 'std:account:enable' },
  { name: 'std:account:unlock' },
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

  async getLocalActions(_port: number): Promise<LocalAction[]> {
    await delay(400);
    return MOCK_LOCAL_ACTIONS;
  }

  async executeLocalAction(_port: number, action: string, payload: any): Promise<ConnectorResponse> {
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

  async getTenantActions(_sourceId: string): Promise<ConnectorAction[]> {
    await delay(300);
    return [];
  }

  async executeTenantAction(_sourceId: string, action: string, payload: any): Promise<ConnectorResponse> {
    await delay(800);
    return {
      status: 200,
      duration: 750,
      body: { action, payload, result: 'mock tenant response' },
    };
  }

  async syncConfig(_target: Target): Promise<ConnectorConfig> {
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
