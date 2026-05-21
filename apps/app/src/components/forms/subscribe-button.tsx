import { Button, type ButtonProps } from "@hoalu/ui/button";

import { useFormContext } from "#app/components/forms/context.ts";

export function SubscribeButton({ children, ...props }: ButtonProps) {
	const form = useFormContext();

	return (
		<form.Subscribe
			selector={(state) => state.isSubmitting}
			children={(isSubmitting) => (
				<Button {...props} disabled={isSubmitting} type="submit">
					{children}
				</Button>
			)}
		/>
	);
}
