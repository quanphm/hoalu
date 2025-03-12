import { TriangleAlertIcon } from "@hoalu/icons/lucide";

export function WarningMessage({ children }: { children: React.ReactNode }) {
	return (
		<span className="text-amber-600 text-sm">
			<TriangleAlertIcon
				className="-mt-0.5 mr-2 inline-flex size-4 text-amber-500"
				strokeWidth={2}
				aria-hidden="true"
			/>
			{children}
		</span>
	);
}
