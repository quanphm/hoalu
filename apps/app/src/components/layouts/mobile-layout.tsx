import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { useTheme } from "next-themes";

import { ChevronDown } from "@hoalu/icons/lucide";
import { Avatar, AvatarFallback } from "@hoalu/ui/avatar";
import { Button } from "@hoalu/ui/button";
import { cn } from "@hoalu/ui/utils";
import { listWorkspacesOptions } from "@/services/query-options";

interface LayoutProps {
	children: React.ReactNode;
}

export function MobileLayout({ children }: LayoutProps) {
	const params = useParams({ strict: false });
	const hasSlug = !!params.slug;
	const { theme } = useTheme();

	return (
		<div className={cn("flex flex-col bg-background pb-16", theme)}>
			{hasSlug && <MobileHeader />}
			<main data-slot="main-content">{children}</main>
			{hasSlug && <MobileBottomNav />}
		</div>
	);
}

function MobileHeader() {
	const params = useParams({ strict: false });

	const { data: workspaces } = useSuspenseQuery(listWorkspacesOptions());
	const currentWorkspace = workspaces.find((ws) => ws.slug === params.slug);
	const handleWorkspaceSwitcher = () => {};

	if (!currentWorkspace) {
		return null;
	}

	return (
		<header className="border-b bg-background">
			<div className="flex h-14 items-center justify-between px-4">
				<div className="flex items-center gap-2">
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
				</div>
			</div>
		</header>
	);
}

function MobileBottomNav() {
	const { slug } = useParams({ from: "/_dashboard/$slug" });

	return (
		<nav className="fixed bottom-0 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="flex h-16 items-center justify-around px-2">
				<Link to="/$slug" params={{ slug }} activeOptions={{ exact: true }}>
					<span>Dashboard</span>
				</Link>
				<Link to="/$slug/expenses" params={{ slug }} activeOptions={{ exact: true }}>
					<span>Expenses</span>
				</Link>
				<Link to="/$slug/tasks" params={{ slug }} activeOptions={{ exact: true }}>
					<span>Task</span>
				</Link>
				<Link to="/$slug/settings" params={{ slug }} activeOptions={{ exact: true }}>
					<span>Settings</span>
				</Link>
				{/* {navItems.map((item) => {
					const isActive = activeTab === item.id;
					const Icon = item.icon;
					return (
						<Button
							key={item.id}
							variant="ghost"
							onClick={() => handleTabPress(item)}
							className={cn(
								"relative flex h-12 min-w-12 flex-col items-center justify-center gap-1 px-2 py-1",
								"font-medium text-xs transition-colors",
								isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
							)}
						>
							<Icon className={cn("h-5 w-5 transition-colors", isActive && "text-primary")} />
							<span className={cn("truncate text-xs leading-none", isActive && "text-primary")}>
								{item.label}
							</span>
							{isActive && (
								<div className="-translate-x-1/2 absolute bottom-0 left-1/2 h-0.5 w-8 rounded-full bg-primary" />
							)}
						</Button>
					);
				})} */}
			</div>
		</nav>
	);
}
