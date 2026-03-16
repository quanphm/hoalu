import { ToastProvider } from "@hoalu/ui/toast";
import { TooltipProvider } from "@hoalu/ui/tooltip";

export function UiProvider({ children }: { children: React.ReactNode }) {
	return (
		<TooltipProvider>
			<ToastProvider position="bottom-center" timeout={3000}>
				{children}
			</ToastProvider>
		</TooltipProvider>
	);
}
