export function ClearDayIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="1em"
			height="1em"
			viewBox="0 0 512 512"
			{...props}
		>
			<defs>
				<linearGradient
					id="meteoconsClearDayFill0"
					x1="150"
					x2="234"
					y1="119.2"
					y2="264.8"
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="0" stopColor="#fbbf24" />
					<stop offset=".5" stopColor="#fbbf24" />
					<stop offset="1" stopColor="#f59e0b" />
				</linearGradient>
				<symbol id="meteoconsClearDayFill1" viewBox="0 0 384 384">
					<circle
						cx="192"
						cy="192"
						r="84"
						fill="url(#meteoconsClearDayFill0)"
						stroke="#f8af18"
						strokeMiterlimit="10"
						strokeWidth="6"
					/>
					<path
						fill="none"
						stroke="#fbbf24"
						strokeLinecap="round"
						strokeMiterlimit="10"
						strokeWidth="24"
						d="M192 61.7V12m0 360v-49.7m92.2-222.5l35-35M64.8 319.2l35.1-35.1m0-184.4l-35-35m254.5 254.5l-35.1-35.1M61.7 192H12m360 0h-49.7"
					>
						<animateTransform
							additive="sum"
							attributeName="transform"
							dur="6s"
							repeatCount="indefinite"
							type="rotate"
							values="0 192 192; 45 192 192"
						/>
					</path>
				</symbol>
			</defs>
			<use width="384" height="384" href="#meteoconsClearDayFill1" transform="translate(64 64)" />
		</svg>
	);
}
