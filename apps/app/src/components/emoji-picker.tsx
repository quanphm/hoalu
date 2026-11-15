import { FacePlusIcon } from "@hoalu/icons/nucleo";
import { XIcon } from "@hoalu/icons/phosphor";
import { Popover, PopoverContent, PopoverTrigger } from "@hoalu/ui/popover";
import { cn } from "@hoalu/ui/utils";
import * as React from "react";

const EmojiPickerPanel = React.lazy(() =>
	import("#app/components/emoji-picker-panel.tsx").then((m) => ({ default: m.EmojiPickerPanel })),
);

export function EmojiPicker(props: {
	emoji?: string | null;
	size?: "icon" | "icon-sm";
	onEmojiSelect?(emoji: string): void;
	onEmojiClear?(): void;
}) {
	const [isOpen, setIsOpen] = React.useState(false);
	const hasEmoji = Boolean(props.emoji);

	const select = React.useEffectEvent((emoji: string) => {
		props.onEmojiSelect?.(emoji);
		setIsOpen(false);
	});

	return (
		<div className="border-input bg-card flex shrink-0 items-center overflow-hidden rounded-md border">
			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger
					render={
						<button
							type="button"
							aria-label={hasEmoji ? "Change emoji" : "Add emoji"}
							title={hasEmoji ? "Change emoji" : "Add emoji"}
							className={cn(
								"hover:bg-accent focus-visible:ring-ring grid place-items-center transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:outline-hidden focus-visible:ring-inset",
								"text-base",
								props.size === "icon-sm" ? "size-7" : "size-8",
								"pointer-coarse:size-9",
							)}
						/>
					}
				>
					{hasEmoji ? props.emoji : <FacePlusIcon className="text-muted-foreground size-4" />}
				</PopoverTrigger>
				<PopoverContent className="w-fit overflow-auto p-0" align="start">
					{isOpen && (
						<React.Suspense fallback={<div className="h-[326px] w-[296px]" />}>
							<EmojiPickerPanel onSelect={select} />
						</React.Suspense>
					)}
				</PopoverContent>
			</Popover>
			{hasEmoji && props.onEmojiClear && (
				<>
					<div className="bg-border h-4 w-px shrink-0" aria-hidden="true" />
					<button
						type="button"
						aria-label="Remove emoji"
						title="Remove emoji"
						onClick={() => props.onEmojiClear?.()}
						className={cn(
							"text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring grid place-items-center transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:outline-hidden focus-visible:ring-inset",
							props.size === "icon-sm" ? "h-7 w-6" : "h-8 w-6",
							"pointer-coarse:h-9 pointer-coarse:w-7",
						)}
					>
						<XIcon className="size-3" />
					</button>
				</>
			)}
		</div>
	);
}
