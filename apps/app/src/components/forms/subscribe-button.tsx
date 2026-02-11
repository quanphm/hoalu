import { useFormContext } from "#app/components/forms/context.ts";
import { Button, type ButtonProps } from "@hoalu/ui/button";

export function SubscribeButton({ children, ...props }: ButtonProps) {
	const form = useFormContext();

	return (
		<form.Subscribe>
			<Button type="submit" {...props}>
				{children}
			</Button>
		</form.Subscribe>
	);
}
