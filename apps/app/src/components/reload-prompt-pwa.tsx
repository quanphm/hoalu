import { useRegisterSW } from "virtual:pwa-register/react";
import { useEffect, useState } from "react";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogPopup,
	AlertDialogTitle,
} from "@hoalu/ui/alert-dialog";

export function ReloadPromptPwa() {
	const {
		offlineReady: [offlineReady, setOfflineReady],
		needRefresh: [needRefresh, setNeedRefresh],
		updateServiceWorker,
	} = useRegisterSW();
	const [open, setOpen] = useState(false);

	useEffect(() => {
		setOpen(needRefresh || offlineReady);
	}, [needRefresh, offlineReady]);

	const close = () => {
		setOfflineReady(false);
		setNeedRefresh(false);
		setOpen(false);
	};

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogPopup>
				<AlertDialogHeader>
					<AlertDialogTitle>Application status</AlertDialogTitle>
					<AlertDialogDescription>
						{offlineReady
							? "App ready to work offline"
							: "New content available, click on reload button to update."}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={() => close()}>Close</AlertDialogCancel>
					<AlertDialogAction onClick={() => updateServiceWorker()}>Reload</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogPopup>
		</AlertDialog>
	);
}
