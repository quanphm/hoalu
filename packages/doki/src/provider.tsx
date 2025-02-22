import * as React from "react";
import { EqSyncClientContext } from "./context";

interface EqSyncClientProviderProps {
	baseUrl: string;
	children?: React.ReactNode;
}

function EqSyncClientProvider({ baseUrl, children }: EqSyncClientProviderProps) {
	const value = React.useMemo(() => ({ baseUrl }), [baseUrl]);

	return <EqSyncClientContext.Provider value={value}>{children}</EqSyncClientContext.Provider>;
}

export { EqSyncClientProvider };
