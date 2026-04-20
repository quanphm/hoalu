import { motion } from "motion/react";
import { useEffect, useState } from "react";

const FRAMES = {
	orbit: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
	snake: ["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"],
	pulse: ["⠁", "⠉", "⠙", "⠚", "⠒", "⠂", "⠂", "⠒", "⠲", "⠴", "⠤", "⠄", "⠄", "⠤", "⠴", "⠲", "⠒", "⠂"],
} as const;

function decodeBraille(char: string): boolean[] {
	const bits = char.codePointAt(0)! - 0x2800;
	// Dot order: rows top→bot, left col then right col
	// Bit layout: 0,1,2,6 = left col; 3,4,5,7 = right col
	return [0, 1, 2, 6, 3, 4, 5, 7].map((k) => !!(bits & (1 << k)));
}

const INACTIVE_CHAR = "⠿";

function useFrameCycle(frames: readonly string[], interval: number, active: boolean) {
	const [i, setI] = useState(0);
	useEffect(() => {
		if (!active) return;
		const id = setInterval(() => setI((n) => (n + 1) % frames.length), interval);
		return () => clearInterval(id);
	}, [frames, interval, active]);
	return { frame: frames[i] };
}

// ─── Option 1: Minimal crossfade ─────────────────────────────────────────────
// Single braille char that crossfades between frames. Zero layout shift.

interface BrailleSpinnerProps {
	variant?: keyof typeof FRAMES;
	interval?: number;
	size?: number;
	color?: string;
	label?: string;
	active?: boolean;
}

export function BrailleSpinner({
	variant = "orbit",
	interval = 80,
	size = 28,
	color = "currentColor",
	active = true,
}: BrailleSpinnerProps) {
	const { frame } = useFrameCycle(FRAMES[variant], interval, active);

	return (
		<motion.span
			animate={{ opacity: active ? 1 : 0.25 }}
			transition={{ duration: 0.3, ease: "easeInOut" }}
			style={{ fontSize: size, lineHeight: 1, color, display: "inline-block", width: size }}
		>
			{active ? frame : INACTIVE_CHAR}
		</motion.span>
	);
}

// ─── Option 2: Dot grid with glow ────────────────────────────────────────────
// Decodes each braille char into a 4×2 grid of symbols.
// Swapping onSymbol / offSymbol gives completely different looks.

interface BrailleGridSpinnerProps {
	variant?: keyof typeof FRAMES;
	interval?: number;
	dotSize?: number;
	dotGap?: number;
	onSymbol?: string;
	offSymbol?: string;
	color?: string;
	glowColor?: string;
	label?: string;
}

export function BrailleGridSpinner({
	variant = "snake",
	interval = 100,
	dotSize = 8,
	dotGap = 4,
	onSymbol = "●",
	offSymbol = "·",
	color = "#f5a623",
	glowColor = "#f5a623",
	label,
}: BrailleGridSpinnerProps) {
	const { frame } = useFrameCycle(FRAMES[variant], interval, true);
	const dots = decodeBraille(frame);
	// 4 rows × 2 cols: indices [0..3] = left col, [4..7] = right col
	const grid: [number, number][] = [
		[0, 4],
		[1, 5],
		[2, 6],
		[3, 7],
	];

	return (
		<div className="flex items-center gap-3">
			<div
				style={{
					display: "grid",
					gridTemplateColumns: `${dotSize}px ${dotSize}px`,
					gap: dotGap,
					filter: `drop-shadow(0 0 4px ${glowColor})`,
				}}
			>
				{grid.flatMap(([l, r], row) => [
					<motion.span
						key={`l${row}`}
						animate={{ opacity: dots[l] ? 1 : 0.15 }}
						transition={{ duration: 0.06 }}
						style={{
							fontSize: dotSize,
							lineHeight: 1,
							color,
							display: "block",
							textAlign: "center",
						}}
					>
						{dots[l] ? onSymbol : offSymbol}
					</motion.span>,
					<motion.span
						key={`r${row}`}
						animate={{ opacity: dots[r] ? 1 : 0.15 }}
						transition={{ duration: 0.06 }}
						style={{
							fontSize: dotSize,
							lineHeight: 1,
							color,
							display: "block",
							textAlign: "center",
						}}
					>
						{dots[r] ? onSymbol : offSymbol}
					</motion.span>,
				])}
			</div>
			{label && <span className="text-muted-foreground text-sm">{label}</span>}
		</div>
	);
}
