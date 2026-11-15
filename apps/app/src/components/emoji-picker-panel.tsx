import {
	type EmojiPickerListCategoryHeaderProps,
	type EmojiPickerListEmojiProps,
	type EmojiPickerListRowProps,
	EmojiPicker as Frimousse,
} from "frimousse";
import * as React from "react";

const EmojiSelectContext = React.createContext<(emoji: string) => void>(() => {});
EmojiSelectContext.displayName = "EmojiSelectContext";

export function EmojiPickerPanel({ onSelect }: { onSelect(emoji: string): void }) {
	return (
		<EmojiSelectContext.Provider value={onSelect}>
			<Frimousse.Root
				className="isolate flex h-[326px] w-fit flex-col"
				onEmojiSelect={({ emoji }) => onSelect(emoji)}
			>
				<Frimousse.Search className="bg-muted text-foreground placeholder:text-muted-foreground z-10 mx-2 mt-2 appearance-none rounded-md px-2.5 py-2 text-sm outline-hidden" />
				<Frimousse.Viewport className="relative flex-1 outline-hidden">
					<Frimousse.Loading className="text-muted-foreground absolute inset-0 flex items-center justify-center text-sm">
						Loading…
					</Frimousse.Loading>
					<Frimousse.Empty className="text-muted-foreground absolute inset-0 flex items-center justify-center text-sm">
						No emoji found.
					</Frimousse.Empty>
					<Frimousse.List className="pb-1.5 select-none" components={LIST_COMPONENTS} />
				</Frimousse.Viewport>
			</Frimousse.Root>
		</EmojiSelectContext.Provider>
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

function EmojiButton({ emoji, ...rest }: EmojiPickerListEmojiProps) {
	const select = React.useContext(EmojiSelectContext);

	return (
		<button
			type="button"
			className="data-active:bg-accent flex size-8 items-center justify-center rounded-sm text-lg outline-hidden"
			{...rest}
			onClick={() => select(emoji.emoji)}
		>
			{emoji.emoji}
		</button>
	);
}

const LIST_COMPONENTS = { CategoryHeader, Row, Emoji: EmojiButton };
