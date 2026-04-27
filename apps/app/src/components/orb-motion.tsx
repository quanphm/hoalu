import { cn } from "@hoalu/ui/utils";

function colorsForTrend(trend: number) {
	if (trend > 0) {
		// emerald
		return {
			inner: "rgba(52, 211, 153, 0.95)",
			mid: "rgba(16, 185, 129, 0.55)",
			outer: "rgba(16, 185, 129, 0)",
			ring: "rgba(52, 211, 153, 0.45)",
		};
	}
	if (trend < 0) {
		// rose / red
		return {
			inner: "rgba(251, 113, 133, 0.95)",
			mid: "rgba(244, 63, 94, 0.55)",
			outer: "rgba(244, 63, 94, 0)",
			ring: "rgba(251, 113, 133, 0.45)",
		};
	}
	// neutral slate-blue
	return {
		inner: "rgba(148, 163, 184, 0.9)",
		mid: "rgba(100, 116, 139, 0.5)",
		outer: "rgba(100, 116, 139, 0)",
		ring: "rgba(148, 163, 184, 0.4)",
	};
}

const cornerClasses: Record<NonNullable<PulseOrbProps["corner"]>, string> = {
	"top-left": "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
	"top-right": "top-0 right-0 translate-x-1/2 -translate-y-1/2",
	"bottom-left": "-bottom-2 left-0 -translate-x-1/2 translate-y-1/2",
	"bottom-right": "-bottom-2 right-0 translate-x-1/2 translate-y-1/2",
	"bottom-center": "-bottom-2 left-1/2 -translate-x-1/2 translate-y-1/2",
};

interface PulseOrbProps {
	corner?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "bottom-center";
	/**
	 * Trend value used to derive color.
	 * > 0 → emerald, < 0 → rose, 0 → slate/blue
	 */
	trend: number;
	size?: number;
}

export function PulseOrb({ corner = "top-right", trend, size = 220 }: PulseOrbProps) {
	const c = colorsForTrend(trend);

	return (
		<div
			aria-hidden="true"
			className={`pointer-events-none absolute opacity-70 ${cornerClasses[corner]}`}
			style={{ width: size, height: size }}
		>
			{/* Soft blurred gradient body */}
			<div
				className="absolute inset-0 rounded-full blur-3xl"
				style={{
					background: `radial-gradient(circle at 50% 50%, ${c.inner} 0%, ${c.mid} 35%, ${c.outer} 70%)`,
					animation: "orb-pulse 1.8s ease-in-out infinite",
				}}
			/>
			{/* Crisper inner core */}
			<div
				className="absolute inset-[30%] rounded-full blur-md"
				style={{
					background: `radial-gradient(circle at 50% 50%, ${c.inner} 0%, ${c.outer} 80%)`,
					animation: "orb-pulse-core 1.8s ease-in-out infinite",
				}}
			/>
			{/* Expanding ring ping */}
			{/* <div
				className="absolute inset-[42%] rounded-full"
				style={{
					boxShadow: `0 0 0 2px ${c.ring}`,
					animation: "orb-ring 2.4s cubic-bezier(0.22, 1, 0.36, 1) infinite",
				}}
			/> */}

			<style>{`
        @keyframes orb-pulse {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50%      { transform: scale(1.08); opacity: 1; }
        }
        @keyframes orb-pulse-core {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50%      { transform: scale(1.18); opacity: 1; }
        }
        @keyframes orb-ring {
          0%   { transform: scale(0.6); opacity: 0.9; }
          80%  { transform: scale(2.4); opacity: 0; }
          100% { transform: scale(2.4); opacity: 0; }
        }
      `}</style>
		</div>
	);
}

export function MoodGlow({
	trend,
	className,
}: {
	trend: "increase" | "decrease" | "no-change";
	className?: string;
}) {
	return (
		<div
			aria-hidden="true"
			className={cn(
				"pointer-events-none absolute -top-6 left-1/2 size-30 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl",
				"motion-safe:animation-duration-[4s] motion-safe:animate-pulse",
				className,
				trend === "increase"
					? "bg-success/30"
					: trend === "decrease"
						? "bg-destructive/30"
						: "bg-muted/30",
			)}
		/>
	);
}

interface ShineBorderProps extends React.HTMLAttributes<HTMLDivElement> {
	/**
	 * Width of the border in pixels
	 * @default 1
	 */
	borderWidth?: number;
	/**
	 * Duration of the animation in seconds
	 * @default 14
	 */
	duration?: number;
	/**
	 * Color of the border, can be a single color or an array of colors
	 * @default "#000000"
	 */
	shineColor?: string | string[];
}

export function ShineBorder({
	borderWidth = 1,
	duration = 14,
	shineColor = "#000000",
	className,
	style,
	...props
}: ShineBorderProps) {
	return (
		<div
			style={
				{
					"--border-width": `${borderWidth}px`,
					"--duration": `${duration}s`,
					backgroundImage: `radial-gradient(transparent,transparent, ${
						Array.isArray(shineColor) ? shineColor.join(",") : shineColor
					},transparent,transparent)`,
					backgroundSize: "300% 300%",
					mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
					WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
					WebkitMaskComposite: "xor",
					maskComposite: "exclude",
					padding: "var(--border-width)",
					...style,
				} as React.CSSProperties
			}
			className={cn(
				"motion-safe:animate-shine pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-[background-position]",
				className,
			)}
			{...props}
		/>
	);
}

export function BoxAnimations({ status }: { status: "increase" | "decrease" | "no-change" }) {
	if (status === "no-change") return null;
	if (status === "increase") {
		return (
			<>
				<ShineBorder duration={24} shineColor={["#7bf1a8", "#032e15"]} />
				<MoodGlow trend="increase" />
			</>
		);
	}
	return (
		<>
			<ShineBorder duration={24} shineColor={["#ffa2a2", "#460809"]} />
			<MoodGlow trend="decrease" />
		</>
	);
}
