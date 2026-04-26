import { createWalletTheme } from "#app/helpers/colors.ts";
import { Badge } from "@hoalu/ui/badge";
import { cn } from "@hoalu/ui/utils";

import type { WalletTypeSchema } from "@hoalu/common/schema";

interface WalletCommonProps {
	name: string;
	type: WalletTypeSchema;
}

export function WalletBadge(props: WalletCommonProps) {
	return (
		<Badge className="flex gap-1.5 bg-transparent">
			<WalletLabel {...props} />
		</Badge>
	);
}

export function WalletLabel(props: WalletCommonProps) {
	return (
		<>
			<span
				className={cn("size-2 rounded-full", createWalletTheme(props.type))}
				aria-hidden="true"
			/>
			<span title={props.name} className="text-muted-foreground max-w-[100px] min-w-0 truncate">
				{props.name}
			</span>
		</>
	);
}
