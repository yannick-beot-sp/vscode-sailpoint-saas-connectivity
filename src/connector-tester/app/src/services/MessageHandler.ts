import { Messenger } from './Messenger';

class MessageHandler {
  private pendingRequests = new Map<string, (data: any) => void>();

  constructor() {
    Messenger.listen((event: MessageEvent) => {
      const { requestId, payload } = event.data ?? {};
      if (requestId && this.pendingRequests.has(requestId)) {
        const resolve = this.pendingRequests.get(requestId)!;
        this.pendingRequests.delete(requestId);
        resolve(payload);
      }
    });
  }

  async request<T>(command: string, payload?: any): Promise<T> {
    return new Promise<T>((resolve) => {
      const requestId = Math.random().toString(36).substring(2, 11);
      this.pendingRequests.set(requestId, resolve as (data: any) => void);
      Messenger.sendWithReqId(command, requestId, payload);
    });
  }
}

export const messageHandler = new MessageHandler();
