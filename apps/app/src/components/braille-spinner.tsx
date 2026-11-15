import { cn } from "@hoalu/ui/utils";
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
			className={cn("inline-block")}
			style={{ fontSize: size, color, width: size }}
		>
			{active ? frame : INACTIVE_CHAR}
		</motion.span>
	);
}
