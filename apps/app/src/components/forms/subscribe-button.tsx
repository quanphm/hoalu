import { Button, type ButtonProps } from "@hoalu/ui/button";
import { SoundButton } from "../sound-button";
import { useFormContext } from "./context";

export function SubscribeButton({
	children,
	useSound = false,
	...props
}: ButtonProps & { useSound?: boolean }) {
	const form = useFormContext();

	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(_isSubmitting) => {
				if (!useSound) {
					return (
						<Button type="submit" {...props}>
							{children}
						</Button>
					);
				}
				return (
					<SoundButton type="submit" {...props}>
						{children}
					</SoundButton>
				);
			}}
		</form.Subscribe>
	);
}
