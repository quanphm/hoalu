import type { PropsWithChildren } from "react";

import { Dialog, DialogContent, DialogTrigger } from "@hoalu/ui/dialog";

export function MultiDialogsProvider(props: PropsWithChildren) {
	return (
		<Dialog>
			<DialogTrigger>Trigger</DialogTrigger>
			<DialogContent>Content</DialogContent>
			{props.children}
		</Dialog>
	);
}
