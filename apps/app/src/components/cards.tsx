import { Button } from "@hoalu/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@hoalu/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";
import { cn } from "@hoalu/ui/utils";
import { type VariantProps, cva } from "class-variance-authority";
import { intlFormatDistance } from "date-fns";
import { StarIcon } from "lucide-react";

interface BasicCardProps extends React.ComponentPropsWithRef<"div"> {
	title: string;
	content: string;
}

function ContentCard({ className, title, content, ...props }: BasicCardProps) {
	return (
		<Card className={cn("hover:border-foreground/20", className)} {...props}>
			<CardHeader className="flex flex-row items-start justify-between p-4">
				<CardTitle className="text-base">{title}</CardTitle>
			</CardHeader>
			<CardContent className="p-4 pt-0">
				<p className="text-muted-foreground text-xs">{content}</p>
			</CardContent>
		</Card>
	);
}

interface WorkspaceCardProps {
	id: number;
	name: string;
	slug: string;
	createdAt: Date;
	publicId: string;
	logo?: string | null | undefined;
}

function WorkspaceCard(props: WorkspaceCardProps) {
	return (
		<Card className="hover:border-foreground/20">
			<CardHeader className="flex flex-row items-start justify-between p-4">
				<CardTitle className="text-base">{props.name}</CardTitle>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="link" size="icon" className="h-4 w-4">
							<StarIcon className="size-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent showArrow>
						<p>Favourite</p>
					</TooltipContent>
				</Tooltip>
			</CardHeader>
			<CardContent className="p-4 pt-0">
				<p className="text-muted-foreground text-xs">
					Created {intlFormatDistance(props.createdAt, new Date())}
				</p>
			</CardContent>
		</Card>
	);
}

const settingCardVariants = cva("flex", {
	variants: {
		variant: {
			default: "border border-border",
			destructive: "border border-destructive",
		},
		layout: {
			default: "flex-col",
			horizontal: "flex-row justify-between items-center",
		},
	},
	defaultVariants: {
		variant: "default",
		layout: "default",
	},
});

interface SettingCardProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof settingCardVariants> {
	title: string;
	description?: string;
}

function SettingCard({
	variant,
	layout,
	className,
	title,
	description,
	children,
	...props
}: SettingCardProps) {
	return (
		<Card
			className={cn(settingCardVariants({ variant, layout }), "group", className)}
			data-layout={layout}
			{...props}
		>
			<CardHeader className="p-4">
				<CardTitle className="text-base">{title}</CardTitle>
				{description && <CardDescription>{description}</CardDescription>}
			</CardHeader>
			<CardContent className="p-4 group-not-data-[layout=horizontal]:pt-0">{children}</CardContent>
		</Card>
	);
}

export { ContentCard, WorkspaceCard, SettingCard };
