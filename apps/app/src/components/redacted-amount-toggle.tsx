import { EyeIcon, EyeSlashIcon } from "@hoalu/icons/phosphor";
import { Button } from "@hoalu/ui/button";
import { cn } from "@hoalu/ui/utils";
import { useValue } from "@legendapp/state/react";

import { redactedAmount$ } from "#app/atoms/index.ts";

export function RedactedAmountToggle() {
	const isRedacted = useValue(redactedAmount$);

	return (
		<Button
			variant="outline"
			size="icon-sm"
			onClick={redactedAmount$.toggle}
			title={isRedacted ? "Show amounts" : "Hide amounts"}
			className={cn(isRedacted && "border-primary [&_svg]:text-primary")}
		>
			{isRedacted ? <EyeSlashIcon /> : <EyeIcon />}
		</Button>
	);
}
