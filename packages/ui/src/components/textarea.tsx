import type * as React from "react";
import { cn } from "../utils";

const Textarea = ({ className, ...props }: React.ComponentPropsWithRef<"textarea">) => {
	return (
		<textarea
			className={cn(
				"flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground text-sm placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
};
Textarea.displayName = "Textarea";

export { Textarea };
