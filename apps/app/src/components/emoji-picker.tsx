import {
	type EmojiPickerListCategoryHeaderProps,
	type EmojiPickerListEmojiProps,
	type EmojiPickerListRowProps,
	EmojiPicker as Frimousse,
} from "frimousse";
import * as React from "react";

import { FacePlusIcon } from "@hoalu/icons/nucleo";
import { Button } from "@hoalu/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@hoalu/ui/popover";

export function EmojiPicker(props: { onEmojiSelect?(emoji: string): void }) {
	const [isOpen, setIsOpen] = React.useState(false);

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger render={<Button variant="outline" size="icon" className="size-9" />}>
				<FacePlusIcon className="size-4" />
			</PopoverTrigger>
			<PopoverContent className="w-fit overflow-auto p-0" align="start">
				<Frimousse.Root
					className="isolate flex h-[326px] w-fit flex-col bg-white dark:bg-neutral-900"
					onEmojiSelect={({ emoji }) => {
						props.onEmojiSelect?.(emoji);
						setIsOpen(false);
					}}
				>
					<Frimousse.Search className="z-10 mx-2 mt-2 appearance-none rounded-md bg-neutral-100 px-2.5 py-2 text-sm dark:bg-neutral-800" />
					<Frimousse.Viewport className="relative flex-1 outline-hidden">
						<Frimousse.Loading className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm dark:text-neutral-500">
							Loading…
						</Frimousse.Loading>
						<Frimousse.Empty className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm dark:text-neutral-500">
							No emoji found.
						</Frimousse.Empty>
						<Frimousse.List
							className="select-none pb-1.5"
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
			className="bg-white px-3 pt-3 pb-1.5 font-medium text-neutral-600 text-xs dark:bg-neutral-900 dark:text-neutral-400"
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
			className="flex size-8 items-center justify-center rounded-md text-lg data-[active]:bg-neutral-100 dark:data-[active]:bg-neutral-800"
			{...props}
		>
			{emoji.emoji}
		</button>
	);
}
