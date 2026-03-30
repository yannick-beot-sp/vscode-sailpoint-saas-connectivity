import type { ConnectorClient } from './Client';
import { MockupClient } from './MockupClient';
import { VsCodeClient } from './VsCodeClient';

export class ClientFactory {
  public static getClient(): ConnectorClient {
    if (typeof acquireVsCodeApi === 'undefined') {
      return new MockupClient();
    }
    return new VsCodeClient();
  }
}
