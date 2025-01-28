import { extractLetterFromName } from "@/helpers/extract-letter-from-name";
import { Avatar, AvatarFallback, AvatarImage } from "@hoalu/ui/avatar";
import { cn } from "@hoalu/ui/utils";
import { type VariantProps, cva } from "class-variance-authority";

const workspaceAvatarVariants = cva("rounded-lg", {
	variants: {
		size: {
			default: "h-8 w-8",
			sm: "h-6 w-6 rounded-sm",
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
	return (
		<Avatar className={cn(workspaceAvatarVariants({ size, className }))}>
			<AvatarImage src={logo || undefined} alt={name} />
			<AvatarFallback className={cn(workspaceAvatarVariants({ size }))}>
				{extractLetterFromName(name)}
			</AvatarFallback>
		</Avatar>
	);
}
