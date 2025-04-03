export interface Connector {
    id: string;
    alias: string;
}

export interface LogMessage {
    tenantID: string;
    timestamp: Date; // Use string for ISO 8601 compatibility, parse when needed
    level: string;
    event: string;
    component: string;
    targetID: string;
    targetName: string;
    requestID: string;
    message: unknown; // Equivalent to Go's interface{}
}

export interface LogEvents {
    nextToken?: string; // Optional field
    logs: LogMessage[];
}

export interface LogFilter {
    startTime?: Date;
    endTime?: Date;
    component?: string;
    logLevels?: string[];
    targetID?: string;
    targetName?: string;
    requestID?: string;
    event?: string;
}

export interface LogRequest {
    filter: LogFilter
    nextToken?: string // Allow optional nextToken directly
}

export interface TenantStats {
    tenantID: string;
    connectors: ConnectorStats[]; // Renamed from ConnectorStats for clarity
}

export interface ConnectorStats {
    connectorID: string;
    alias: string;
    stats: CommandStats[];
}

export interface CommandStats {
    commandType: string;
    invocationCount: number; // uint32 maps to number
    errorCount: number;      // uint32 maps to number
    errorRate: number;       // float64 maps to number
    elapsedAvg: number;      // float64 maps to number (milliseconds)
    elapsed95th: number;     // float64 maps to number (milliseconds)
}