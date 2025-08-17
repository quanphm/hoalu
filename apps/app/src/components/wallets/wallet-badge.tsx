import { Badge } from "@hoalu/ui/badge";
import { cn } from "@hoalu/ui/utils";
import { createWalletTheme } from "@/helpers/colors";
import type { WalletTypeSchema } from "@/lib/schema";

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
			<span className="max-w-[100px] truncate">{props.name}</span>
		</>
	);
}
