import { extractLetterFromName } from "@/helpers/extract-letter-from-name";
import { Avatar, AvatarFallback, AvatarImage } from "@hoalu/ui/avatar";
import { cn } from "@hoalu/ui/utils";
import { type VariantProps, cva } from "class-variance-authority";

const workspaceAvatarVariants = cva("rounded-lg", {
	variants: {
		size: {
			default: "h-8 w-8",
			sm: "h-4 w-4 rounded-sm",
			lg: "h-12 w-12",
		},
	},
	defaultVariants: {
		size: "default",
	},
});

interface Props {
	logo: string | null | undefined;
	name: string;
	className?: string;
}

export function WorkspaceAvatar({
	logo = "",
	name,
	size,
	className,
}: Props & VariantProps<typeof workspaceAvatarVariants>) {
	return (
		<Avatar className={cn(workspaceAvatarVariants({ size, className }))}>
			<AvatarImage src={logo || ""} alt={name} />
			<AvatarFallback className={cn(workspaceAvatarVariants({ size }))}>
				{extractLetterFromName(name)}
			</AvatarFallback>
		</Avatar>
	);
}
