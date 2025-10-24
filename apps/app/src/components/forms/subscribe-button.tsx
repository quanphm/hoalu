import { Button, type ButtonProps } from "@hoalu/ui/button";

import { SoundButton } from "../sound-button";
import { useFormContext } from "./context";

export function SubscribeButton({
	children,
	useSound = false,
	...props
}: ButtonProps & { useSound?: boolean }) {
	const form = useFormContext();
	const ButtonComponent = useSound ? SoundButton : Button;

	return (
		<form.Subscribe>
			<ButtonComponent type="submit" {...props}>
				{children}
			</ButtonComponent>
		</form.Subscribe>
	);
}
