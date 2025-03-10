import { extractLetterFromName } from "@/helpers/extract-letter-from-name";
import { Avatar, AvatarFallback, AvatarImage } from "@hoalu/ui/avatar";
import { cn } from "@hoalu/ui/utils";
import { type VariantProps, cva } from "class-variance-authority";

const workspaceAvatarVariants = cva("rounded-lg", {
	variants: {
		size: {
			default: "size-8",
			lg: "size-14 rounded-xl",
			sm: "size-6",
		},
	},
	defaultVariants: {
		size: "default",
	},
});

interface Props {
	logo: string | null | undefined;
	name: string | undefined;
	className?: string;
}

export function WorkspaceAvatar({
	logo = undefined,
	name = "Hoa Lu",
	size,
	className,
}: Props & VariantProps<typeof workspaceAvatarVariants>) {
	const workspaceShortName = extractLetterFromName(name);
	return (
		<Avatar className={cn(workspaceAvatarVariants({ size, className }))}>
			<AvatarImage
				src={logo || `https://avatar.vercel.sh/${logo}.svg`}
				alt={name}
				className={cn(!logo && "grayscale")}
			/>
			<AvatarFallback className={cn(workspaceAvatarVariants({ size }))}>
				{workspaceShortName}
			</AvatarFallback>
		</Avatar>
	);
}
