import { Separator as SeparatorPrimitive } from "@base-ui-components/react/separator";

import { cn } from "../utils";

function Separator({
	className,
	orientation = "horizontal",
	...props
}: React.ComponentProps<typeof SeparatorPrimitive>) {
	return (
		<SeparatorPrimitive
			data-slot="separator"
			orientation={orientation}
			className={cn(
				"shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px",
				className,
			)}
			{...props}
		/>
	);
}

export { Separator };
