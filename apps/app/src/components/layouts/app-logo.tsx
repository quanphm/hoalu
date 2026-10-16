import { RobotIcon } from "@hoalu/icons/phosphor";
import { Link } from "@tanstack/react-router";

export function AppLogo() {
	return (
		<Link
			to="/"
			aria-label="Hoalu home"
			className="hover:bg-overlay-hover flex items-center gap-2 rounded-lg px-2 py-1 transition-colors"
		>
			<RobotIcon className="size-5" aria-hidden="true" />
			<span className="hidden text-sm font-semibold sm:inline">HoaLu.app</span>
		</Link>
	);
}
