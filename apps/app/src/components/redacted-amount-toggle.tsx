import { redactedAmountAtom } from "#app/atoms/index.ts";
import { EyeIcon, EyeOffIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { cn } from "@hoalu/ui/utils";
import { useAtom } from "jotai";

export function RedactedAmountToggle() {
	const [isRedacted, setRedacted] = useAtom(redactedAmountAtom);

	return (
		<Button
			variant="outline"
			size="icon-sm"
			onClick={() => setRedacted((v) => !v)}
			title={isRedacted ? "Show amounts" : "Hide amounts"}
			className={cn(isRedacted && "border-primary [&_svg]:text-primary")}
		>
			{isRedacted ? <EyeOffIcon /> : <EyeIcon />}
		</Button>
	);
}
