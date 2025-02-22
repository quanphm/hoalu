import * as React from "react";
import { DokiClientContext } from "./context";

interface EqSyncClientProviderProps {
	baseUrl: string;
	children?: React.ReactNode;
}

function DokiClientProvider({ baseUrl, children }: EqSyncClientProviderProps) {
	const value = React.useMemo(() => ({ baseUrl }), [baseUrl]);

	return <DokiClientContext.Provider value={value}>{children}</DokiClientContext.Provider>;
}

export { DokiClientProvider };
