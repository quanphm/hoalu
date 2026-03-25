import { redactedAmountAtom } from "#app/atoms/index.ts";
import { EyeIcon, EyeOffIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { useAtom } from "jotai";

export function RedactedAmountToggle() {
	const [redacted, setRedacted] = useAtom(redactedAmountAtom);

	return (
		<Button
			variant="outline"
			size="icon-lg"
			onClick={() => setRedacted((v) => !v)}
			title={redacted ? "Show amounts" : "Hide amounts"}
		>
			{redacted ? <EyeOffIcon /> : <EyeIcon />}
		</Button>
	);
}
