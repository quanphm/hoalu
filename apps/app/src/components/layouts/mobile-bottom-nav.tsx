import { useParams, useRouter } from "@tanstack/react-router";
import { useAtom } from "jotai";

import { BarChart3, CreditCard, LayoutDashboard, Settings } from "@hoalu/icons/lucide";
import { Badge } from "@hoalu/ui/badge";
import { Button } from "@hoalu/ui/button";
import { cn } from "@hoalu/ui/utils";
import { type MobileTab, mobileActiveTabAtom, setMobileActiveTabAtom } from "@/atoms";

interface BottomNavItem {
	id: MobileTab;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	route: string;
	badge?: number | string;
}

/**
 * Mobile bottom navigation component
 * Provides tab-based navigation for primary app sections
 */
export function MobileBottomNav() {
	const router = useRouter();
	const params = useParams({ strict: false });
	const [activeTab] = useAtom(mobileActiveTabAtom);
	const [, setActiveTab] = useAtom(setMobileActiveTabAtom);

	const currentSlug = params.slug;

	const navItems: BottomNavItem[] = [
		{
			id: "dashboard",
			label: "Dashboard",
			icon: LayoutDashboard,
			route: currentSlug ? `/${currentSlug}` : "/",
		},
		{
			id: "expenses",
			label: "Expenses",
			icon: CreditCard,
			route: currentSlug ? `/${currentSlug}/expenses` : "/",
			// badge: 3, // TODO: Connect to actual unsynced count
		},
		{
			id: "tasks",
			label: "Tasks",
			icon: BarChart3,
			route: currentSlug ? `/${currentSlug}/tasks` : "/",
		},
		{
			id: "settings",
			label: "Settings",
			icon: Settings,
			route: currentSlug ? `/${currentSlug}/settings` : "/settings",
		},
	];

	const handleTabPress = (item: BottomNavItem) => {
		setActiveTab(item.id);

		// Navigate to the route
		router.navigate({
			to: item.route as any,
		});
	};

	return (
		<nav className="safe-area-bottom mt-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="flex h-16 items-center justify-around px-2">
				{navItems.map((item) => {
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
							<div className="relative">
								<Icon className={cn("h-5 w-5 transition-colors", isActive && "text-primary")} />

								{/* Badge for notifications/counts */}
								{item.badge && (
									<Badge
										variant="destructive"
										className="-right-2 -top-2 absolute h-4 min-w-4 px-1 text-xs"
									>
										{item.badge}
									</Badge>
								)}
							</div>

							<span className={cn("truncate text-xs leading-none", isActive && "text-primary")}>
								{item.label}
							</span>

							{/* Active indicator */}
							{isActive && (
								<div className="-translate-x-1/2 absolute bottom-0 left-1/2 h-0.5 w-8 rounded-full bg-primary" />
							)}
						</Button>
					);
				})}
			</div>
		</nav>
	);
}

/**
 * Floating Action Button for quick actions
 * Positioned above the bottom navigation
 */
export function MobileFAB({
	onPress,
	icon = "+",
	className,
	...props
}: {
	onPress: () => void;
	icon?: React.ReactNode;
	className?: string;
	[key: string]: any;
}) {
	return (
		<div className="safe-area-bottom fixed right-4 bottom-20 z-50">
			<Button
				size="lg"
				onClick={onPress}
				className={cn(
					"h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95",
					"bg-primary text-primary-foreground hover:bg-primary/90",
					className,
				)}
				{...props}
			>
				{typeof icon === "string" ? <span className="font-semibold text-xl">{icon}</span> : icon}
				<span className="sr-only">Quick action</span>
			</Button>
		</div>
	);
}
