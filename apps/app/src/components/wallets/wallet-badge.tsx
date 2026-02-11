import { createWalletTheme } from "#app/helpers/colors.ts";
import type { WalletTypeSchema } from "@hoalu/common/schema";
import { Badge } from "@hoalu/ui/badge";
import { cn } from "@hoalu/ui/utils";

interface WalletCommonProps {
	name: string;
	type: WalletTypeSchema;
}

export function WalletBadge(props: WalletCommonProps) {
	return (
		<Badge variant="outline" className="bg-background gap-1.5">
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
			<span title={props.name} className="max-w-[100px] min-w-0 truncate">
				{props.name}
			</span>
		</>
	);
}
