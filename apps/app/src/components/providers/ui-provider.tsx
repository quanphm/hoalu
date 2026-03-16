import { ToastProvider } from "@hoalu/ui/toast";
import { TooltipProvider } from "@hoalu/ui/tooltip";

import { HapticsProvider } from "./haptics-provider.tsx";

export function UiProvider({ children }: { children: React.ReactNode }) {
	return (
		<HapticsProvider>
			<TooltipProvider>
				<ToastProvider position="bottom-center" timeout={3000}>
					{children}
				</ToastProvider>
			</TooltipProvider>
		</HapticsProvider>
	);
}
