import * as React from "react";

export interface EqSyncClient {
	baseUrl: string;
}

export const EqSyncClientContext = React.createContext<EqSyncClient | undefined>(undefined);
