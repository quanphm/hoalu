import { cn } from "../utils";

const Card = ({ className, ...props }: React.ComponentPropsWithRef<"div">) => (
	<div
		className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
		{...props}
	/>
);
Card.displayName = "Card";

const CardHeader = ({ className, ...props }: React.ComponentPropsWithRef<"div">) => (
	<div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
);
CardHeader.displayName = "CardHeader";

const CardTitle = ({ className, ...props }: React.ComponentPropsWithRef<"div">) => (
	<div className={cn("font-semibold text-2xl leading-none tracking-tight", className)} {...props} />
);
CardTitle.displayName = "CardTitle";

const CardDescription = ({ className, ...props }: React.ComponentPropsWithRef<"div">) => (
	<div className={cn("text-muted-foreground text-sm", className)} {...props} />
);
CardDescription.displayName = "CardDescription";

const CardContent = ({ className, ...props }: React.ComponentPropsWithRef<"div">) => (
	<div className={cn("p-6 pt-0", className)} {...props} />
);
CardContent.displayName = "CardContent";

const CardFooter = ({ className, ...props }: React.ComponentPropsWithRef<"div">) => (
	<div className={cn("flex items-center p-6 pt-0", className)} {...props} />
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
