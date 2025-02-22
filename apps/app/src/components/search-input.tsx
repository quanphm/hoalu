import { SearchIcon } from "@hoalu/icons/lucide";
import { Input } from "@hoalu/ui/input";
import { useId } from "react";

export function SearchInput() {
	const id = useId();

	return (
		<div className="space-y-2">
			<div className="relative w-lg">
				<Input
					id={id}
					className="ps-11 pe-11"
					placeholder="Search"
					type="search"
					autoComplete="off"
				/>
				<div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
					<SearchIcon size={16} strokeWidth={2} aria-hidden="true" />
				</div>
				<div className="absolute inset-y-0 end-0 flex items-center justify-center pe-2 text-muted-foreground">
					<kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium text-[10px] sm:flex">
						/
					</kbd>
				</div>
			</div>
		</div>
	);
}
