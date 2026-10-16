import { TentIcon, UsersIcon } from "@hoalu/icons/phosphor";

/**
 * The destinations in the top tab strip, in order.
 *
 * "Bills" is deliberately shorter than the page's own "Recurring bills" heading:
 * eight tabs plus the logo and the user menu have to fit on one row.
 */
export const WORKSPACE_NAV = [
	{ label: "Dashboard", to: "/$slug", exact: true },
	{ label: "Transactions", to: "/$slug/transactions", exact: false },
	{ label: "Bills", to: "/$slug/recurring-bills", exact: false },
	{ label: "Events", to: "/$slug/events", exact: false },
	{ label: "Categories", to: "/$slug/categories", exact: false },
	{ label: "Wallets", to: "/$slug/wallets", exact: false },
	{ label: "Files", to: "/$slug/files", exact: false },
	{ label: "Settings", to: "/$slug/settings", exact: false },
] as const;

/** The settings sub-navigation. */
export const SETTINGS_NAV = [
	{ label: "Workspace", to: "/$slug/settings/workspace", icon: TentIcon },
	{ label: "Members", to: "/$slug/settings/members", icon: UsersIcon },
] as const;
