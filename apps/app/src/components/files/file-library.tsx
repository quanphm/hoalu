import { datetime } from "@hoalu/datetime/datetime";
import {
	ArrowSquareOutIcon,
	FilePdfIcon,
	ImagesIcon,
	MagnifyingGlassIcon,
} from "@hoalu/icons/phosphor";
import { Button } from "@hoalu/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@hoalu/ui/empty";
import { Input } from "@hoalu/ui/input";
import { useCallback, useDeferredValue, useMemo, useState } from "react";

import { FileSheet } from "#app/components/files/file-sheet.tsx";
import { FileViewer } from "#app/components/files/file-viewer.tsx";
import {
	fileSearchAmount,
	fileSearchFields,
	formatFileSize,
	groupByMonth,
	type LibraryFile,
	partitionEntries,
	toFileEntries,
} from "#app/components/files/files-model.ts";
import {
	Section,
	SectionAction,
	SectionDescription,
	SectionHeader,
	SectionTitle,
} from "#app/components/layouts/section.tsx";
import { useFuzzyFilter } from "#app/hooks/use-fuzzy-search.ts";

interface FileLibraryProps {
	files: LibraryFile[];
	imageTotal: number;
	query: string;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	onLoadMore: () => void;
}

export function FileLibrary({
	files,
	imageTotal,
	query,
	hasNextPage,
	isFetchingNextPage,
	onLoadMore,
}: FileLibraryProps) {
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const deferredQuery = useDeferredValue(query);

	const entries = useMemo(() => toFileEntries(files), [files]);
	const matched = useFuzzyFilter(entries, deferredQuery, {
		getTextFields: fileSearchFields,
		getNumericValue: fileSearchAmount,
	});

	const { images, others } = useMemo(() => partitionEntries(matched), [matched]);
	const imageGroups = useMemo(() => groupByMonth(images), [images]);
	const indexById = useMemo(
		() => new Map(images.map((entry, index) => [entry.id, index])),
		[images],
	);
	const selectedIndex = selectedId === null ? null : (indexById.get(selectedId) ?? null);
	const isFiltered = deferredQuery.trim().length > 0;

	const selectIndex = useCallback(
		(next: number | null) => {
			setSelectedId(next === null ? null : (images[next]?.id ?? null));
		},
		[images],
	);

	if (entries.length === 0) {
		return (
			<Section>
				<Empty className="min-h-60">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<ImagesIcon />
						</EmptyMedia>
						<EmptyTitle>No files yet</EmptyTitle>
						<EmptyDescription>
							Receipts and photos attached to an expense appear here.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			</Section>
		);
	}

	return (
		<div className="flex flex-col gap-8">
			{imageTotal > 0 && (
				<Section className="gap-3">
					<SectionHeader>
						<SectionTitle>
							Photos{" "}
							<span className="text-muted-foreground text-2xs tabular-nums">
								{isFiltered
									? `${images.length} of ${imageTotal}`
									: `${imageTotal} ${imageTotal === 1 ? "image" : "images"}`}
							</span>
						</SectionTitle>
					</SectionHeader>

					{images.length === 0 ? (
						hasNextPage || isFetchingNextPage ? (
							<p className="text-muted-foreground text-2xs">Loading files…</p>
						) : isFiltered ? (
							<Empty className="min-h-52">
								<EmptyHeader>
									<EmptyMedia variant="icon">
										<MagnifyingGlassIcon />
									</EmptyMedia>
									<EmptyTitle>No files match “{query.trim()}”</EmptyTitle>
									<EmptyDescription>
										Search by title, transaction, category, or month.
									</EmptyDescription>
								</EmptyHeader>
							</Empty>
						) : null
					) : (
						<FileSheet
							groups={imageGroups}
							hasNextPage={hasNextPage}
							isFetchingNextPage={isFetchingNextPage}
							onLoadMore={onLoadMore}
							onOpen={(id) => setSelectedId(id)}
						/>
					)}
				</Section>
			)}

			{others.length > 0 && (
				<Section className="gap-3">
					<SectionHeader>
						<SectionTitle>Other files</SectionTitle>
						<SectionAction>
							<span className="text-muted-foreground text-2xs tabular-nums">{others.length}</span>
						</SectionAction>
					</SectionHeader>
					<ul className="border-border divide-border divide-y overflow-hidden rounded-md border">
						{others.map((entry) => {
							const size = formatFileSize(entry.size);
							return (
								<li key={entry.id}>
									<a
										href={entry.url}
										target="_blank"
										rel="noreferrer"
										className="hover:bg-accent/50 focus-visible:ring-ring/60 flex items-center gap-3 px-3 py-2 transition-colors focus-visible:ring-2 focus-visible:outline-none"
									>
										<FilePdfIcon className="text-muted-foreground size-4 shrink-0" />
										<span className="min-w-0 flex-1 truncate text-sm font-medium">
											{entry.title}
										</span>
										{size && (
											<span className="text-muted-foreground text-2xs tabular-nums">{size}</span>
										)}
										<span className="text-muted-foreground text-2xs tabular-nums">
											{datetime.format(entry.date, "MMM d, yyyy")}
										</span>
										<ArrowSquareOutIcon className="text-muted-foreground size-3.5 shrink-0" />
									</a>
								</li>
							);
						})}
					</ul>
				</Section>
			)}

			<FileViewer
				entries={images}
				index={selectedIndex}
				onSelect={selectIndex}
				hasMore={hasNextPage}
				isLoadingMore={isFetchingNextPage}
				onLoadMore={onLoadMore}
			/>
		</div>
	);
}

interface FileSearchProps {
	value: string;
	onValueChange: (value: string) => void;
}

export function FileSearch({ value, onValueChange }: FileSearchProps) {
	return (
		<div className="flex w-full min-w-0 items-center gap-2 sm:w-96">
			<div className="relative min-w-0 flex-1">
				<Input
					type="search"
					size="sm"
					aria-label="Search files"
					placeholder="Search title, transaction, category, month…"
					className="peer ps-6 focus-visible:ring-0"
					value={value}
					onChange={(event) => onValueChange(event.target.value)}
				/>
				<div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
					<MagnifyingGlassIcon className="text-muted-foreground size-3" aria-hidden="true" />
				</div>
			</div>
			{value.length > 0 && (
				<Button size="xs" variant="ghost" onClick={() => onValueChange("")}>
					Clear
				</Button>
			)}
		</div>
	);
}
