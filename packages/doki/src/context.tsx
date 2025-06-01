import * as React from "react";

export interface DokiClient {
	baseUrl: string;
}

const DokiClientContext = React.createContext<DokiClient | undefined>(undefined);

interface EqSyncClientProviderProps {
	baseUrl: string;
	children?: React.ReactNode;
}

function DokiClientProvider({ baseUrl, children }: EqSyncClientProviderProps) {
	const value = React.useMemo(() => ({ baseUrl }), [baseUrl]);

	return <DokiClientContext.Provider value={value}>{children}</DokiClientContext.Provider>;
}

export { DokiClientContext, DokiClientProvider };
