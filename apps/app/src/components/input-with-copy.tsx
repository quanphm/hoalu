import { Input } from "@hoalu/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@hoalu/ui/tooltip";
import { cn } from "@hoalu/ui/utils";
import { Check, Copy } from "lucide-react";
import { useId, useRef, useState } from "react";

export function InputWithCopy({ value }: { value: string }) {
	const id = useId();
	const [copied, setCopied] = useState<boolean>(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleCopy = () => {
		if (inputRef.current) {
			navigator.clipboard.writeText(inputRef.current.value);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		}
	};

	return (
		<div className="relative">
			<Input
				ref={inputRef}
				id={id}
				className="bg-muted pe-9"
				type="text"
				defaultValue={value}
				readOnly
			/>
			<TooltipProvider delayDuration={0}>
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type="button"
							onClick={handleCopy}
							className="absolute inset-y-0 end-0 flex h-full w-9 cursor-pointer items-center justify-center rounded-e-lg border border-transparent text-muted-foreground/80 outline-offset-2 hover:text-foreground focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed"
							aria-label={copied ? "Copied" : "Copy to clipboard"}
							disabled={copied}
						>
							<div
								className={cn(
									"transition-all",
									copied ? "scale-100 opacity-100" : "scale-0 opacity-0",
								)}
							>
								<Check
									className="stroke-emerald-500"
									size={16}
									strokeWidth={2}
									aria-hidden="true"
								/>
							</div>
							<div
								className={cn(
									"absolute transition-all",
									copied ? "scale-0 opacity-0" : "scale-100 opacity-100",
								)}
							>
								<Copy size={16} strokeWidth={2} aria-hidden="true" />
							</div>
						</button>
					</TooltipTrigger>
					<TooltipContent className="px-2 py-1 text-xs">Copy to clipboard</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	);
}
