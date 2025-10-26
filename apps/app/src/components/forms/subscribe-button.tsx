import { Button, type ButtonProps } from "@hoalu/ui/button";

import { useFormContext } from "#app/components/forms/context.ts";

export function SubscribeButton({
	children,
	useSound = false,
	...props
}: ButtonProps & { useSound?: boolean }) {
	const form = useFormContext();

	return (
		<form.Subscribe>
			<Button type="submit" {...props}>
				{children}
			</Button>
		</form.Subscribe>
	);
}
