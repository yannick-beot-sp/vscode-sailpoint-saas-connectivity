interface ClientVsCode<T> {
  getState: () => T;
  setState: (data: T) => void;
  postMessage: (msg: unknown) => void;
}

export class Messenger {
  private static vscode: any;

  public static getVsCodeAPI<T>(): ClientVsCode<T> {
    if (!Messenger.vscode) {
      Messenger.vscode = acquireVsCodeApi();
    }
    return Messenger.vscode;
  }

  public static listen(callback: (event: MessageEvent) => void): void {
    window.addEventListener('message', callback);
  }

  public static unlisten(callback: (event: MessageEvent) => void): void {
    window.removeEventListener('message', callback);
  }

  public static send(command: string, payload?: any): void {
    const vscode = Messenger.getVsCodeAPI();
    if (payload !== undefined) {
      vscode.postMessage({ command, payload });
    } else {
      vscode.postMessage({ command });
    }
  }

  public static sendWithReqId(command: string, requestId: string, payload?: any): void {
    const vscode = Messenger.getVsCodeAPI();
    if (payload !== undefined) {
      vscode.postMessage({ command, requestId, payload });
    } else {
      vscode.postMessage({ command, requestId });
    }
  }

  public static getState(): any {
    const vscode = Messenger.getVsCodeAPI();
    return vscode.getState();
  }

  public static setState(data: any): void {
    const vscode = Messenger.getVsCodeAPI();
    vscode.setState({ ...data });
  }
}
