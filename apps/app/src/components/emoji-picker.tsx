import { FacePlusIcon } from "@hoalu/icons/nucleo";
import { Button } from "@hoalu/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@hoalu/ui/popover";
import {
	type EmojiPickerListCategoryHeaderProps,
	type EmojiPickerListEmojiProps,
	type EmojiPickerListRowProps,
	EmojiPicker as Frimousse,
} from "frimousse";
import * as React from "react";

export function EmojiPicker(props: { onEmojiSelect?(emoji: string): void }) {
	const [isOpen, setIsOpen] = React.useState(false);

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger render={<Button variant="outline" size="icon" />}>
				<FacePlusIcon className="size-4" />
			</PopoverTrigger>
			<PopoverContent className="w-fit overflow-auto p-0" align="start">
				<Frimousse.Root
					className="bg-popover isolate flex h-[326px] w-fit flex-col"
					onEmojiSelect={({ emoji }) => {
						props.onEmojiSelect?.(emoji);
						setIsOpen(false);
					}}
				>
					<Frimousse.Search className="bg-muted z-10 mx-2 mt-2 appearance-none rounded-md px-2.5 py-2 text-sm" />
					<Frimousse.Viewport className="relative flex-1 outline-hidden">
						<Frimousse.Loading className="text-faint absolute inset-0 flex items-center justify-center text-sm">
							Loading…
						</Frimousse.Loading>
						<Frimousse.Empty className="text-faint absolute inset-0 flex items-center justify-center text-sm">
							No emoji found.
						</Frimousse.Empty>
						<Frimousse.List
							className="pb-1.5 select-none"
							components={{
								CategoryHeader,
								Row,
								Emoji,
							}}
						/>
					</Frimousse.Viewport>
				</Frimousse.Root>
			</PopoverContent>
		</Popover>
	);
}

function CategoryHeader({ category, ...props }: EmojiPickerListCategoryHeaderProps) {
	return (
		<div
			className="bg-popover text-muted-foreground px-3 pt-3 pb-1.5 text-xs font-medium"
			{...props}
		>
			{category.label}
		</div>
	);
}

function Row(props: EmojiPickerListRowProps) {
	return <div className="scroll-my-1.5 px-1.5" {...props} />;
}

function Emoji({ emoji, ...props }: EmojiPickerListEmojiProps) {
	return (
		<button
			className="data-active:bg-secondary flex size-8 items-center justify-center text-lg"
			{...props}
		>
			{emoji.emoji}
		</button>
	);
}
