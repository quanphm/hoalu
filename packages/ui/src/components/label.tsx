import { Label as LabelPrimitive } from "radix-ui";
import type * as React from "react";
import { cn } from "../utils";

function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
	return (
		<LabelPrimitive.Root
			data-slot="label"
			className={cn(
				"select-none font-medium text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

export { Label, type LabelPrimitive };
