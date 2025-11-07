interface IconProps extends React.SVGProps<SVGSVGElement> {
	strokeWidth?: number;
	size?: string;
}

export function LinkIcon({ strokeWidth = 1.5, size = "1em", ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			x="0px"
			y="0px"
			width={size}
			height={size}
			viewBox="0 0 18 18"
			{...props}
		>
			<path
				d="M14.6892 9.66862L12.5298 7.5092C11.1486 6.12805 8.90935 6.12805 7.5282 7.5092C6.14704 8.89036 6.14704 11.1296 7.5282 12.5108L9.68761 14.6702C11.0688 16.0514 13.3081 16.0514 14.6892 14.6702C16.0704 13.2891 16.0704 11.0498 14.6892 9.66862Z"
				fill="currentColor"
				fillOpacity="0.3"
				data-color="color-2"
				data-stroke="none"
			></path>{" "}
			<path
				d="M8.36909 6.8934C8.06649 7.0539 7.78239 7.2617 7.52799 7.517L7.51799 7.527C6.13699 8.908 6.13699 11.146 7.51799 12.527L9.69299 14.702C11.074 16.083 13.312 16.083 14.693 14.702L14.703 14.692C16.084 13.311 16.084 11.073 14.703 9.692L13.9406 8.9296"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
			></path>{" "}
			<path
				d="M9.63288 11.1066C9.93548 10.9461 10.2196 10.7383 10.474 10.483L10.484 10.473C11.865 9.09199 11.865 6.85399 10.484 5.47299L8.30899 3.29799C6.92799 1.91699 4.68999 1.91699 3.30899 3.29799L3.29899 3.30799C1.91799 4.68899 1.91799 6.92699 3.29899 8.30799L4.06139 9.07039"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
			></path>
		</svg>
	);
}
