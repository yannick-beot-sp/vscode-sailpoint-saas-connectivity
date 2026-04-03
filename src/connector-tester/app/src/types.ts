export type Target =
  | { type: 'local'; port: number }
  | { type: 'tenant'; connectorId: string; connectorAlias: string };

export type ConnectorItem = {
  id: string;
  alias: string;
};

export type ConnectorRequest = {
  target: Target;
  action: string;
  payload: any;
};

export type ConnectorResponse = {
  status: number;
  duration: number;
  headers?: Record<string, string>;
  body: any;
  error?: string;
};

export type CallHistoryItem = {
  id: string;
  timestamp: string;
  request: ConnectorRequest;
  response?: ConnectorResponse;
  config?: string;
};

export type ConnectorConfig = Record<string, any>;

export type ConnectorSource = {
  id: string;
  name: string;
};

export type EnvFile = {
  name: string;
  path: string;
};

export type AppState = {
  target: Target;
  selectedAction: string | null;
  body: string;
  response: ConnectorResponse | null;
  history: CallHistoryItem[];
  loading: boolean;
  error: string | null;
};
