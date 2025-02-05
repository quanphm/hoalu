import { extractLetterFromName } from "@/helpers/extract-letter-from-name";
import { Avatar, AvatarFallback, AvatarImage } from "@hoalu/ui/avatar";

export function UserAvatar({ image = null, name }: { image?: string | null; name: string }) {
	const userShortName = extractLetterFromName(name);
	return (
		<Avatar className="size-8">
			<AvatarImage
				src={image || `https://avatar.vercel.sh/${name}.svg`}
				alt={name}
				className="rounded-full"
			/>
			<AvatarFallback className="rounded-full">{userShortName}</AvatarFallback>
		</Avatar>
	);
}
