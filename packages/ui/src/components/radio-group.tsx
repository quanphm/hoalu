import { Radio as RadioPrimitive } from "@base-ui-components/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui-components/react/radio-group";

import { CircleIcon } from "@hoalu/icons/lucide";
import { cn } from "../utils";

function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive>) {
	return (
		<RadioGroupPrimitive
			data-slot="radio-group"
			className={cn("grid gap-3", className)}
			{...props}
		/>
	);
}

function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioPrimitive.Root>) {
	return (
		<RadioPrimitive.Root
			data-slot="radio-group-item"
			className={cn(
				"aspect-square size-4 shrink-0 rounded-full border border-input text-primary outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40",
				className,
			)}
			{...props}
		>
			<RadioPrimitive.Indicator
				data-slot="radio-group-indicator"
				className="relative flex items-center justify-center"
			>
				<CircleIcon className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 size-2 fill-primary" />
			</RadioPrimitive.Indicator>
		</RadioPrimitive.Root>
	);
}

export { RadioGroup, RadioGroupItem };
