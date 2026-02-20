import { CommandItem } from "@hoalu/ui/command";

import type { ActionItem as ActionItemType, AutocompleteItem } from "./types.ts";

interface ActionItemProps {
	action: ActionItemType;
	autocompleteItem: AutocompleteItem;
	itemIndex: number;
	style: React.CSSProperties;
}

export function ActionItem({ action, autocompleteItem, itemIndex, style }: ActionItemProps) {
	return (
		<CommandItem
			value={autocompleteItem}
			index={itemIndex}
			className="hover:bg-foreground/5 focus-visible:ring-ring absolute top-0 left-0 flex min-h-8 w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none focus-visible:ring-2"
			style={style}
			onClick={action.onAction}
		>
			<span className="flex-1">{action.label}</span>
			{action.meta}
		</CommandItem>
	);
}
