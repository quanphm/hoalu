import * as React from "react";

export interface DokiClient {
	baseUrl: string;
}

export const DokiClientContext = React.createContext<DokiClient | undefined>(undefined);
