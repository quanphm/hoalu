import { atom } from "jotai";

// Mobile navigation tab types based on current routes
export type MobileTab = "expenses" | "tasks" | "settings" | "dashboard";

// Mobile sheet content types
export type MobileSheetContent =
	| "workspace-switcher"
	| "profile"
	| "filters"
	| "expense-details"
	| "expense-actions"
	| null;

// Mobile header configuration
export interface MobileHeaderConfig {
	title: string;
	showBack: boolean;
	actions: Array<{
		id: string;
		icon: string;
		label: string;
		onClick: () => void;
	}>;
}

// Mobile navigation state atoms
export const mobileActiveTabAtom = atom<MobileTab>("expenses");

export const mobileBottomNavVisibleAtom = atom<boolean>(true);

export const mobileHeaderConfigAtom = atom<MobileHeaderConfig>({
	title: "Expenses",
	showBack: false,
	actions: [],
});

export const mobileSheetStateAtom = atom<{
	isOpen: boolean;
	content: MobileSheetContent;
	title?: string;
	data?: any;
}>({
	isOpen: false,
	content: null,
});

// Derived atoms for specific mobile states
export const isMobileSheetOpenAtom = atom((get) => get(mobileSheetStateAtom).isOpen);

export const mobileSheetContentAtom = atom((get) => get(mobileSheetStateAtom).content);

// Action atoms for mobile navigation
export const openMobileSheetAtom = atom(
	null,
	(
		_get,
		set,
		{
			content,
			title,
			data,
		}: {
			content: MobileSheetContent;
			title?: string;
			data?: any;
		},
	) => {
		set(mobileSheetStateAtom, {
			isOpen: true,
			content,
			title,
			data,
		});
	},
);

export const closeMobileSheetAtom = atom(null, (_get, set) => {
	set(mobileSheetStateAtom, {
		isOpen: false,
		content: null,
	});
});

export const setMobileActiveTabAtom = atom(null, (_get, set, tab: MobileTab) => {
	set(mobileActiveTabAtom, tab);
});

export const updateMobileHeaderAtom = atom(
	null,
	(get, set, config: Partial<MobileHeaderConfig>) => {
		const current = get(mobileHeaderConfigAtom);
		set(mobileHeaderConfigAtom, {
			...current,
			...config,
		});
	},
);

export const toggleMobileBottomNavAtom = atom(null, (get, set, visible?: boolean) => {
	const current = get(mobileBottomNavVisibleAtom);
	set(mobileBottomNavVisibleAtom, visible ?? !current);
});

// Mobile-specific UI state atoms
export const mobileScrollPositionAtom = atom<Record<string, number>>({});

export const mobileFabVisibleAtom = atom<boolean>(true);

export const mobileKeyboardVisibleAtom = atom<boolean>(false);

// Workspace-specific mobile state
export const mobileWorkspaceSwitcherAtom = atom<{
	isOpen: boolean;
	recentWorkspaces: string[];
}>({
	isOpen: false,
	recentWorkspaces: [],
});
