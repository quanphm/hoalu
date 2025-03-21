export function PartlyCloudyDayIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="1em"
			height="1em"
			viewBox="0 0 512 512"
			{...props}
		>
			<defs>
				<symbol id="meteoconsPartlyCloudyDayFill0" viewBox="0 0 196 196">
					<circle
						cx="98"
						cy="98"
						r="40"
						fill="url(#meteoconsPartlyCloudyDayFill4)"
						stroke="#f8af18"
						strokeMiterlimit="10"
						strokeWidth="4"
					/>
					<path
						fill="none"
						stroke="#fbbf24"
						strokeLinecap="round"
						strokeMiterlimit="10"
						strokeWidth="12"
						d="M98 31.4V6m0 184v-25.4M145.1 51l18-17.9M33 163l18-17.9M51 51L33 33m130.1 130.1l-18-18M6 98h25.4M190 98h-25.4"
					>
						<animateTransform
							additive="sum"
							attributeName="transform"
							dur="6s"
							repeatCount="indefinite"
							type="rotate"
							values="0 98 98; 45 98 98"
						/>
					</path>
				</symbol>
				<symbol id="meteoconsPartlyCloudyDayFill1" viewBox="0 0 350 222">
					<path
						fill="url(#meteoconsPartlyCloudyDayFill3)"
						stroke="#e6effc"
						strokeMiterlimit="10"
						strokeWidth="6"
						d="m291 107l-2.5.1A83.9 83.9 0 0 0 135.6 43A56 56 0 0 0 51 91a56.6 56.6 0 0 0 .8 9A60 60 0 0 0 63 219l4-.2v.2h224a56 56 0 0 0 0-112Z"
					/>
				</symbol>
				<symbol id="meteoconsPartlyCloudyDayFill2" viewBox="0 0 363 258">
					<use width="196" height="196" href="#meteoconsPartlyCloudyDayFill0" />
					<use
						width="350"
						height="222"
						href="#meteoconsPartlyCloudyDayFill1"
						transform="translate(13 36)"
					/>
				</symbol>
				<linearGradient
					id="meteoconsPartlyCloudyDayFill3"
					x1="99.5"
					x2="232.6"
					y1="30.7"
					y2="261.4"
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="0" stopColor="#f3f7fe" />
					<stop offset=".5" stopColor="#f3f7fe" />
					<stop offset="1" stopColor="#deeafb" />
				</linearGradient>
				<linearGradient
					id="meteoconsPartlyCloudyDayFill4"
					x1="78"
					x2="118"
					y1="63.4"
					y2="132.7"
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="0" stopColor="#fbbf24" />
					<stop offset=".5" stopColor="#fbbf24" />
					<stop offset="1" stopColor="#f59e0b" />
				</linearGradient>
			</defs>
			<use
				width="363"
				height="258"
				href="#meteoconsPartlyCloudyDayFill2"
				transform="translate(68 109)"
			/>
		</svg>
	);
}
