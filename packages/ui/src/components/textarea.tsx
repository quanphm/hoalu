import * as React from "react";
import { useAutoResizeTextarea } from "../hooks/use-auto-resize-textarea";
import { cn } from "../utils";

export interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	autoResize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, autoResize = false, ...props }, ref) => {
		const { textAreaRef } = useAutoResizeTextarea(ref, autoResize);

		return (
			<textarea
				className={cn(
					"flex min-h-[80px] w-full resize-none rounded-md border border-alpha bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:border-alpha-600 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
					className,
				)}
				ref={textAreaRef}
				{...props}
			/>
		);
	},
);
Textarea.displayName = "Textarea";

export { Textarea };
