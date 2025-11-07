interface IconProps extends React.SVGProps<SVGSVGElement> {
	strokeWidth?: number;
	size?: string;
}

export function CameraIcon({ strokeWidth = 1.5, size = "1em", ...props }: IconProps) {
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
				fillRule="evenodd"
				clipRule="evenodd"
				d="M12 3.75H14.25C15.355 3.75 16.25 4.645 16.25 5.75V12.25C16.25 13.355 15.355 14.25 14.25 14.25H3.75C2.645 14.25 1.75 13.355 1.75 12.25V5.75C1.75 4.645 2.645 3.75 3.75 3.75H6L6.507 2.399C6.653 2.009 7.026 1.75 7.443 1.75H10.557C10.974 1.75 11.347 2.009 11.493 2.399L12 3.75ZM11.75 9C11.75 10.5188 10.5188 11.75 9 11.75C7.48122 11.75 6.25 10.5188 6.25 9C6.25 7.48122 7.48122 6.25 9 6.25C10.5188 6.25 11.75 7.48122 11.75 9Z"
				fill="currentColor"
				fillOpacity="0.3"
				data-color="color-2"
				data-stroke="none"
			></path>{" "}
			<path
				d="M14.25 3.75H12L11.493 2.399C11.347 2.009 10.974 1.75 10.557 1.75H7.443C7.026 1.75 6.653 2.009 6.507 2.399L6 3.75H3.75C2.645 3.75 1.75 4.645 1.75 5.75V12.25C1.75 13.355 2.645 14.25 3.75 14.25H14.25C15.355 14.25 16.25 13.355 16.25 12.25V5.75C16.25 4.645 15.355 3.75 14.25 3.75Z"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
			></path>{" "}
			<path
				d="M9 11.75C10.5188 11.75 11.75 10.5188 11.75 9C11.75 7.48122 10.5188 6.25 9 6.25C7.48122 6.25 6.25 7.48122 6.25 9C6.25 10.5188 7.48122 11.75 9 11.75Z"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
			></path>{" "}
			<path
				d="M4.25 7C4.66421 7 5 6.66421 5 6.25C5 5.83579 4.66421 5.5 4.25 5.5C3.83579 5.5 3.5 5.83579 3.5 6.25C3.5 6.66421 3.83579 7 4.25 7Z"
				fill="currentColor"
				data-stroke="none"
			></path>
		</svg>
	);
}
