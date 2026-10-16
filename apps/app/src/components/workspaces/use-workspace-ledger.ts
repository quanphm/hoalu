import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { listWorkspaceSummariesOptions } from "#app/services/query-options.ts";
import {
	buildLedgerRows,
	defaultDirectionFor,
	filterLedgerRows,
	type LedgerSort,
	type LedgerSortDirection,
	sortLedgerRows,
} from "#app/services/workspace-ledger-model.ts";

/** The reader's own calendar date — the server's UTC date is not their today. */
function localToday(): string {
	const now = new Date();
	const pad = (value: number) => String(value).padStart(2, "0");
	return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function useWorkspaceLedger() {
	const { data, isPending, isError, error, refetch } = useQuery(listWorkspaceSummariesOptions());
	const [sort, setSort] = useState<LedgerSort>("urgency");
	const [sortDirection, setSortDirection] = useState<LedgerSortDirection>("desc");
	const [needsAttentionOnly, setNeedsAttentionOnly] = useState(false);

	// The page is not expected to outlive its own day; matching the dashboard's
	// minute-tick greeting would re-sort rows under the reader mid-session.
	const today = useMemo(() => localToday(), []);

	const rows = useMemo(() => {
		const built = buildLedgerRows(data ?? [], today);
		return sortLedgerRows(filterLedgerRows(built, needsAttentionOnly), sort, sortDirection);
	}, [data, sort, sortDirection, needsAttentionOnly, today]);

	/** Clicking the active column reverses it; a new column adopts its own default. */
	const toggleSort = useCallback(
		(next: LedgerSort) => {
			if (next === sort) {
				setSortDirection((direction) => (direction === "desc" ? "asc" : "desc"));
				return;
			}
			setSort(next);
			setSortDirection(defaultDirectionFor(next));
		},
		[sort],
	);

	/** Choosing from the select picks a key, never a reversal. */
	const setSortKey = useCallback((next: LedgerSort) => {
		setSort(next);
		setSortDirection(defaultDirectionFor(next));
	}, []);

	return {
		rows,
		workspaceCount: data?.length ?? 0,
		isPending: isPending && !isError,
		isError,
		error,
		refetch,
		sort,
		sortDirection,
		toggleSort,
		setSortKey,
		needsAttentionOnly,
		setNeedsAttentionOnly,
	};
}
