import { Button, type ButtonProps } from "@hoalu/ui/button";
import { confirmSound, soundSafePlay } from "@/lib/sound-effects";

export function SoundButton({ children, onClick, ...props }: ButtonProps) {
	function onClickWithSound(e: React.MouseEvent<HTMLButtonElement>) {
		soundSafePlay(confirmSound);
		onClick?.(e);
	}

	return (
		<Button onClick={onClickWithSound} {...props}>
			{children}
		</Button>
	);
}
