import { useRegisterSW } from "virtual:pwa-register/react";
import { useState } from "react";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@hoalu/ui/alert-dialog";

export function ReloadPromptPwa() {
	// const buildDate: string = "__DATE__";
	// const reloadSW: string = "__RELOAD_SW__";

	const {
		// offlineReady: [offlineReady, setOfflineReady],
		needRefresh: [needRefresh, setNeedRefresh],
		updateServiceWorker,
	} = useRegisterSW({
		onRegisterError(error: unknown) {
			console.error("SW registration error", error);
		},
	});
	const [open, setOpen] = useState(needRefresh);

	const close = () => {
		// setOfflineReady(false);
		setNeedRefresh(false);
		setOpen(false);
	};

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Application status</AlertDialogTitle>
					<AlertDialogDescription>
						New content available, click on reload button to update
						{/* {offlineReady
							? "App ready to work offline"
							: "New content available, click on reload button to update."} */}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={() => close()}>Close</AlertDialogCancel>
					<AlertDialogAction onClick={() => updateServiceWorker()}>Reload</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
