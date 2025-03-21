export function PartlyCloudyNightIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="1em"
			height="1em"
			viewBox="0 0 512 512"
			{...props}
		>
			<defs>
				<symbol id="meteoconsPartlyCloudyNightFill0" viewBox="0 0 172 172">
					<path
						fill="url(#meteoconsPartlyCloudyNightFill4)"
						stroke="#72b9d5"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="4"
						d="M160.6 107.4a84.8 84.8 0 0 1-85.4-84.3A83.3 83.3 0 0 1 78 2A84.7 84.7 0 0 0 2 85.7A84.8 84.8 0 0 0 87.4 170a85.2 85.2 0 0 0 82.6-63.1a88 88 0 0 1-9.4.5Z"
					>
						<animateTransform
							additive="sum"
							attributeName="transform"
							dur="6s"
							repeatCount="indefinite"
							type="rotate"
							values="-15 86 86; 9 86 86; -15 86 86"
						/>
					</path>
				</symbol>
				<symbol id="meteoconsPartlyCloudyNightFill1" viewBox="0 0 350 222">
					<path
						fill="url(#meteoconsPartlyCloudyNightFill3)"
						stroke="#e6effc"
						strokeMiterlimit="10"
						strokeWidth="6"
						d="m291 107l-2.5.1A83.9 83.9 0 0 0 135.6 43A56 56 0 0 0 51 91a56.6 56.6 0 0 0 .8 9A60 60 0 0 0 63 219l4-.2v.2h224a56 56 0 0 0 0-112Z"
					/>
				</symbol>
				<symbol id="meteoconsPartlyCloudyNightFill2" viewBox="0 0 351 246">
					<use width="172" height="172" href="#meteoconsPartlyCloudyNightFill0" />
					<use
						width="350"
						height="222"
						href="#meteoconsPartlyCloudyNightFill1"
						transform="translate(1 24)"
					/>
				</symbol>
				<linearGradient
					id="meteoconsPartlyCloudyNightFill3"
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
					id="meteoconsPartlyCloudyNightFill4"
					x1="34.7"
					x2="119.2"
					y1="18.6"
					y2="165"
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="0" stopColor="#86c3db" />
					<stop offset=".5" stopColor="#86c3db" />
					<stop offset="1" stopColor="#5eafcf" />
				</linearGradient>
			</defs>
			<use
				width="351"
				height="246"
				href="#meteoconsPartlyCloudyNightFill2"
				transform="translate(80 121)"
			/>
		</svg>
	);
}
