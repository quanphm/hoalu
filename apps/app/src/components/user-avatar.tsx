import { Avatar, AvatarFallback, AvatarImage } from "@hoalu/ui/avatar";
import { cn } from "@hoalu/ui/utils";
import { extractLetterFromName } from "@/helpers/extract-letter-from-name";

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
			<AvatarImage src={image ?? undefined} alt={name} />
			<AvatarFallback>{userShortName}</AvatarFallback>
		</Avatar>
	);
}
