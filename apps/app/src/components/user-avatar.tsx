import { extractLetterFromName } from "#app/helpers/extract-letter-from-name.ts";
import { Avatar, AvatarFallback, AvatarImage } from "@hoalu/ui/avatar";
import { cn } from "@hoalu/ui/utils";

export function UserAvatar({
	image = null,
	name,
	className,
}: {
	image?: string | null | undefined;
	name: string;
	className?: string;
}) {
	const userShortName = extractLetterFromName(name);
	return (
		<Avatar className={cn("size-8", className)}>
			<AvatarImage src={image ?? ""} alt={name} />
			<AvatarFallback className="text-xs">{userShortName}</AvatarFallback>
		</Avatar>
	);
}
