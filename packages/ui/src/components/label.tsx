import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "../utils";

const Label = ({ className, ...props }: React.ComponentPropsWithRef<"label">) => (
	<LabelPrimitive.Root
		className={cn(
			"font-medium text-foreground text-sm leading-4 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
			className,
		)}
		{...props}
	/>
);
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
