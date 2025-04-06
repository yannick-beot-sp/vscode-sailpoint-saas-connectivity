export interface Connector {
    id: string;
    alias: string;
}

export interface ConnectorVersion {
    connectorId: string
    version: number
}

export interface LogMessage {
    tenantID: string;
    timestamp: string; // Use string for ISO 8601 compatibility, parse when needed
    level: string;
    event: string;
    component: string;
    targetID: string;
    targetName: string;
    requestID: string;
    message: string;
}

export interface LogEvents {
    nextToken?: string; // Optional field
    logs: LogMessage[];
}

export interface LogFilter {
    startTime?: string;
    endTime?: Date;
    /** component type */
    component?: string;
    logLevels?: string[];
    /** id of the specific target object */
    targetID?: string;
    /** name of the specifiy target */
    targetName?: string;
    /** associated request id */
    requestID?: string;
    /** event name */
    event?: string;
}

export interface LogRequest {
    filter: LogFilter
    nextToken?: string // Allow optional nextToken directly
}


export interface CreateConnectorRequest {
    alias: string
}

export interface CreateConnectorResponse extends Connector {
}

export interface UpdateConnectorRequest {
    alias: string
}

export interface UpdateConnectorResponse extends Connector { }

export interface UploadConnectorResponse extends ConnectorVersion { }

