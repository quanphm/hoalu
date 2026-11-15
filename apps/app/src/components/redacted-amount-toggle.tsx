import { EyeIcon, EyeSlashIcon } from "@hoalu/icons/phosphor";
import { Button, type ButtonProps } from "@hoalu/ui/button";
import { cn } from "@hoalu/ui/utils";
import { useValue } from "@legendapp/state/react";

import { redactedAmount$ } from "#app/atoms/index.ts";

/**
 * The privacy switch for every amount on screen.
 *
 * It lives in the app shell rather than the page toolbar for two reasons: it is
 * not dashboard-specific, and as the last control in a horizontally scrolling
 * toolbar it was completely off-screen on a 390px phone — the one place you are
 * most likely to be showing someone your screen.
 *
 * `aria-pressed` carries the state because the icon and the indigo border alone
 * are a colour-only signal.
 */
export function RedactedAmountToggle({ size = "icon-sm" }: { size?: ButtonProps["size"] }) {
	const isRedacted = useValue(redactedAmount$);

	return (
		<Button
			variant="outline"
			size={size}
			onClick={redactedAmount$.toggle}
			aria-pressed={isRedacted}
			aria-label={isRedacted ? "Show amounts" : "Hide amounts"}
			title={isRedacted ? "Show amounts" : "Hide amounts"}
			className={cn(isRedacted && "border-primary [&_svg]:text-primary")}
		>
			{isRedacted ? <EyeSlashIcon /> : <EyeIcon />}
		</Button>
	);
}
