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

export interface GetInstancesResponse {
    id: string;
    name: string;
    connectorCustomizerId: string;
}


export interface CreateCustomizerRequest {
    name: string
}

export interface CustomizerVersion {
    connectorId: string
    version: number
}

export interface Customizer {
    id: string;
    name: string;
    imageVersion: string;
}

export interface Instance {
    id: string;
    name: string;
    connectorCustomizerId: string;
}

export interface CreateCustomizerResponse extends Customizer {
}

export interface UpdateCustomizerRequest {
    name: string
}

export interface UpdateCustomizerResponse extends Customizer { }

export interface UploadCustomizerResponse extends CustomizerVersion { }


export interface GetInstancesResponse extends Instance { }

export interface LinkRequest {
    op: string;
    path: string;
    value?: string;
}

export interface LinkResponse extends Instance { }

export interface UnlinkRequest extends LinkRequest { }

export interface UnlinkResponse extends LinkResponse { }