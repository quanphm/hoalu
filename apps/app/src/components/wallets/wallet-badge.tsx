import type { WalletTypeSchema } from "@hoalu/common/schema";
import { Badge } from "@hoalu/ui/badge";
import { cn } from "@hoalu/ui/utils";

import { createWalletTheme } from "#app/helpers/colors.ts";

interface WalletCommonProps {
	name: string;
	type: WalletTypeSchema;
}

export function WalletBadge(props: WalletCommonProps) {
	return (
		<Badge variant="outline" className="gap-1.5 bg-background">
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
			<span title={props.name} className="min-w-0 max-w-[100px] truncate">
				{props.name}
			</span>
		</>
	);
}
