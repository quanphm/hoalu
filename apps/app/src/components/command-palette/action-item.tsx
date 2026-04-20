import { CommandItem } from "@hoalu/ui/command";

import type { ActionItem as ActionItemType, AutocompleteItem } from "./types.ts";

interface ActionItemProps {
	action: ActionItemType;
	autocompleteItem: AutocompleteItem;
	itemIndex: number;
}

export function ActionItem({ action, autocompleteItem, itemIndex }: ActionItemProps) {
	return (
		<CommandItem
			value={autocompleteItem.id}
			index={itemIndex}
			className="hover:bg-foreground/5 focus-visible:ring-ring flex min-h-8 w-full cursor-default scroll-my-8 items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none focus-visible:ring-2"
			onClick={action.onAction}
		>
			<span className="flex-1">{action.label}</span>
			{action.meta}
		</CommandItem>
	);
}
