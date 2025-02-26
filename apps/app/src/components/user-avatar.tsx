import { extractLetterFromName } from "@/helpers/extract-letter-from-name";
import { Avatar, AvatarFallback, AvatarImage } from "@hoalu/ui/avatar";
import { cn } from "@hoalu/ui/utils";

export function UserAvatar({
	image = null,
	name,
	className,
}: { image?: string | null | undefined; name: string; className?: string }) {
	const userShortName = extractLetterFromName(name);
	return (
		<Avatar className={cn("size-8", className)}>
			<AvatarImage
				src={image || `https://avatar.vercel.sh/${name}.svg`}
				alt={name}
				className="rounded-full"
			/>
			<AvatarFallback className="rounded-full">{userShortName}</AvatarFallback>
		</Avatar>
	);
}
