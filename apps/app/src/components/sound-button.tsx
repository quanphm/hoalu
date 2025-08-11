import { Button, type ButtonProps } from "@hoalu/ui/button";
import { confirmSound } from "@/lib/sound-effects";

function handleClick() {
	confirmSound.currentTime = 0;
	confirmSound.play();
}

export function SoundButton({ children, ...props }: ButtonProps) {
	return (
		<Button onClick={handleClick} {...props}>
			{children}
		</Button>
	);
}
