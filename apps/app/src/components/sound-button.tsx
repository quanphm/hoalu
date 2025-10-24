import { Button, type ButtonProps } from "@hoalu/ui/button";

import { playConfirmSound } from "#app/lib/sound-effects.ts";

export function SoundButton({ children, onClick, ...props }: ButtonProps) {
	function onClickWithSound(e: React.MouseEvent<HTMLButtonElement>) {
		playConfirmSound();
		onClick?.(e);
	}

	return (
		<Button onClick={onClickWithSound} {...props}>
			{children}
		</Button>
	);
}
