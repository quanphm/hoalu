import { datetime } from "@hoalu/datetime/datetime";

import { htmlToText } from "#app/helpers/dom-parser.ts";

export interface LibraryFile {
	id?: string;
	name: string;
	title: string | null;
	description: string | null;
	mimeType: string | null;
	size: number | null;
	tags?: string[];
	expensePublicId: string | null;
	expenseTitle: string | null;
	expenseCategory: string | null;
	expenseBill: string | null;
	expenseAmount: number | null;
	presignedUrl: string;
	createdAt: string;
}

export type FileKind = "image" | "document" | "other";

export interface FileEntry {
	id: string;
	name: string;
	url: string;
	kind: FileKind;
	title: string;
	date: Date;
	size: number | null;
	description: string | null;
	tags: string[];
	expensePublicId: string | null;
	expenseTitle: string | null;
	expenseCategory: string | null;
	expenseBill: string | null;
	expenseAmount: number | null;
}

export interface FileGroup {
	key: string;
	label: string;
	entries: FileEntry[];
}

const KIND_BY_MIME: [string, FileKind][] = [
	["image/", "image"],
	["application/pdf", "document"],
];

const KIND_BY_PREFIX: Record<string, FileKind> = {
	img: "image",
	pdf: "document",
};

const KIND_TERMS: Record<FileKind, string> = {
	image: "image images photo photos picture receipt receipts scan scanned",
	document: "pdf document documents file files",
	other: "file files attachment",
};

export const TILE_GAP = 8;

function fileKind(file: { name: string; mimeType?: string | null }): FileKind {
	const mime = file.mimeType ?? "";
	for (const [prefix, kind] of KIND_BY_MIME) {
		if (mime.startsWith(prefix)) return kind;
	}

	const separator = file.name.indexOf("_");
	if (separator <= 0) return "other";
	return KIND_BY_PREFIX[file.name.slice(0, separator)] ?? "other";
}

export function toFileEntry(file: LibraryFile): FileEntry {
	const createdAt = new Date(file.createdAt);

	return {
		id: file.id ?? file.name,
		name: file.name,
		url: file.presignedUrl,
		kind: fileKind(file),
		title: file.title?.trim() || file.description?.trim() || "Untitled",
		date: Number.isNaN(createdAt.getTime()) ? new Date(0) : createdAt,
		size: file.size,
		description: file.description,
		tags: file.tags ?? [],
		expensePublicId: file.expensePublicId,
		expenseTitle: file.expenseTitle,
		expenseCategory: file.expenseCategory,
		expenseBill: file.expenseBill,
		expenseAmount: file.expenseAmount,
	};
}

export function toFileEntries(files: LibraryFile[]): FileEntry[] {
	return files.map(toFileEntry).sort((a, b) => b.date.getTime() - a.date.getTime());
}

/**
 * Same field order and numeric semantics as the transactions and command-palette
 * search, so one query behaves the same in both places. File-specific fields
 * (linked transaction, kind, month, size) follow the transaction fields.
 */
export function fileSearchFields(entry: FileEntry): string[] {
	return [
		entry.title,
		htmlToText(entry.description),
		entry.expenseTitle ?? "",
		entry.tags.join(" "),
		entry.expenseCategory ?? "",
		entry.expenseBill ?? "",
		KIND_TERMS[entry.kind],
		datetime.format(entry.date, "MMMM yyyy"),
		datetime.format(entry.date, "d MMM yyyy"),
		formatFileSize(entry.size) ?? "",
	];
}

export function fileSearchAmount(entry: FileEntry): number {
	return entry.expenseAmount ?? 0;
}

export function partitionEntries(entries: FileEntry[]): {
	images: FileEntry[];
	others: FileEntry[];
} {
	const images: FileEntry[] = [];
	const others: FileEntry[] = [];

	for (const entry of entries) {
		if (entry.kind === "image") images.push(entry);
		else others.push(entry);
	}

	return { images, others };
}

export function groupByMonth(entries: FileEntry[]): FileGroup[] {
	const groups = new Map<string, FileGroup>();

	for (const entry of entries) {
		const key = datetime.format(entry.date, "yyyy-MM");
		const group = groups.get(key);
		if (group) {
			group.entries.push(entry);
			continue;
		}

		groups.set(key, {
			key,
			label: datetime.format(entry.date, "MMMM yyyy"),
			entries: [entry],
		});
	}

	return [...groups.values()];
}

const MIN_TILE_WIDTH = 180;
const MAX_COLUMNS = 8;

/**
 * The sheet's column count is measured in JS so keyboard navigation and the CSS
 * grid agree on the row a tile sits in. Columns follow the container's width,
 * not the viewport's: the navigation rail already takes 224px.
 */
export function columnsForWidth(width: number): number {
	if (width <= 0) return 2;
	const columns = Math.floor((width + TILE_GAP) / (MIN_TILE_WIDTH + TILE_GAP));
	return Math.min(MAX_COLUMNS, Math.max(2, columns));
}

export function formatFileSize(bytes: number | null): string | null {
	if (!bytes || bytes < 1) return null;
	const units = ["B", "KB", "MB", "GB"];
	let value = bytes;
	let unit = 0;
	while (value >= 1024 && unit < units.length - 1) {
		value /= 1024;
		unit += 1;
	}
	return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`;
}
