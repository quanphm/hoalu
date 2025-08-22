import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "@tanstack/react-router";
import { useAtom } from "jotai";

import { ArrowLeft, ChevronDown, Menu, User } from "@hoalu/icons/lucide";
import { Avatar, AvatarFallback } from "@hoalu/ui/avatar";
import { Button } from "@hoalu/ui/button";
import { mobileHeaderConfigAtom, openMobileSheetAtom } from "@/atoms";
import { listWorkspacesOptions } from "@/services/query-options";

/**
 * Mobile header component with contextual navigation and actions
 * Provides workspace switching, back navigation, and action buttons
 */
export function MobileHeader() {
	const router = useRouter();
	const params = useParams({ strict: false });
	const [headerConfig] = useAtom(mobileHeaderConfigAtom);
	const [, openSheet] = useAtom(openMobileSheetAtom);

	const { data: workspaces } = useSuspenseQuery(listWorkspacesOptions());
	const currentWorkspace = workspaces.find((ws) => ws.slug === params.slug);

	const handleBack = () => {
		if (window.history.length > 1) {
			router.history.back();
		} else {
			// Fallback to expenses list
			if (currentWorkspace) {
				router.navigate({
					to: "/$slug/expenses",
					params: { slug: currentWorkspace.slug },
				});
			}
		}
	};

	const handleWorkspaceSwitcher = () => {
		openSheet({
			content: "workspace-switcher",
			title: "Switch Workspace",
		});
	};

	const handleProfile = () => {
		openSheet({
			content: "profile",
			title: "Profile & Settings",
		});
	};

	return (
		<header className="safe-area-top border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="flex h-14 items-center justify-between px-4">
				<div className="flex items-center gap-2">
					{headerConfig.showBack ? (
						<Button variant="ghost" size="sm" onClick={handleBack} className="h-9 w-9 p-0">
							<ArrowLeft className="h-4 w-4" />
							<span className="sr-only">Go back</span>
						</Button>
					) : currentWorkspace ? (
						<Button
							variant="ghost"
							onClick={handleWorkspaceSwitcher}
							className="flex items-center gap-2 px-2 py-1.5"
						>
							<Avatar className="h-6 w-6">
								<AvatarFallback className="font-medium text-xs">
									{currentWorkspace.name.charAt(0).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<span className="font-medium">{currentWorkspace.name}</span>
							<ChevronDown className="h-3 w-3 text-muted-foreground" />
						</Button>
					) : (
						<Button variant="ghost" size="sm" className="h-9 w-9 p-0">
							<Menu className="h-4 w-4" />
							<span className="sr-only">Menu</span>
						</Button>
					)}
				</div>

				<div className="flex items-center gap-1">
					<Button variant="ghost" size="sm" onClick={handleProfile} className="h-9 w-9 p-0">
						<User className="h-4 w-4" />
						<span className="sr-only">Profile</span>
					</Button>

					{headerConfig.actions.map((action) => (
						<Button
							key={action.id}
							variant="ghost"
							size="sm"
							onClick={action.onClick}
							className="h-9 w-9 p-0"
						>
							<span className="sr-only">{action.label}</span>
						</Button>
					))}
				</div>
			</div>
		</header>
	);
}

/**
 * Simplified mobile header for pages that don't need full navigation
 */
export function SimpleMobileHeader({
	title,
	onBack,
	actions = [],
}: {
	title: string;
	onBack?: () => void;
	actions?: Array<{
		id: string;
		icon: React.ReactNode;
		label: string;
		onClick: () => void;
	}>;
}) {
	return (
		<header className="safe-area-top border-b bg-background/95 backdrop-blur">
			<div className="flex h-14 items-center justify-between px-4">
				<div className="flex items-center gap-2">
					{onBack && (
						<Button variant="ghost" size="sm" onClick={onBack} className="h-9 w-9 p-0">
							<ArrowLeft className="h-4 w-4" />
							<span className="sr-only">Go back</span>
						</Button>
					)}
					<h1 className="font-semibold">{title}</h1>
				</div>

				<div className="flex items-center gap-1">
					{actions.map((action) => (
						<Button
							key={action.id}
							variant="ghost"
							size="sm"
							onClick={action.onClick}
							className="h-9 w-9 p-0"
						>
							{action.icon}
							<span className="sr-only">{action.label}</span>
						</Button>
					))}
				</div>
			</div>
		</header>
	);
}
