import { WarningIcon } from "@hoalu/icons/phosphor";

export function WarningMessage({ children }: { children: React.ReactNode }) {
	return (
		<span className="rounded-lg border border-amber-700 p-4 text-sm text-amber-600">
			<WarningIcon
				className="-mt-0.5 mr-2 inline-flex size-4 text-amber-600"
				strokeWidth={2}
				aria-hidden="true"
			/>
			{children}
		</span>
	);
}
