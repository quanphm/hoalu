import { extractLetterFromName } from "@/helpers/extract-letter-from-name";
import { Avatar, AvatarFallback, AvatarImage } from "@hoalu/ui/avatar";
import { cn } from "@hoalu/ui/utils";

export function UserAvatar({ image = null, name }: { image?: string | null; name: string }) {
	const userShortName = extractLetterFromName(name);
	return (
		<Avatar className="size-8">
			<AvatarImage
				src={image || `https://avatar.vercel.sh/${name}.svg?text=${userShortName}`}
				alt={name}
				className={cn(!image && "grayscale")}
			/>
			<AvatarFallback>{userShortName}</AvatarFallback>
		</Avatar>
	);
}
