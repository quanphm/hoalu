import { WarningIcon } from "@hoalu/icons/phosphor";

export function WarningMessage({ children }: { children: React.ReactNode }) {
	return (
		<span className="border-warning/30 bg-warning/8 text-warning rounded-lg border p-4 text-sm">
			<WarningIcon
				className="text-warning -mt-0.5 mr-2 inline-flex size-4"
				strokeWidth={2}
				aria-hidden="true"
			/>
			{children}
		</span>
	);
}
