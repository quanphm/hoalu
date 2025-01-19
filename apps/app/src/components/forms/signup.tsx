import { authClient } from "@/lib/auth-client";
import { Link, useRouter } from "@tanstack/react-router";
import { Button } from "@woben/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@woben/ui/card";
import { Input } from "@woben/ui/input";
import { Label } from "@woben/ui/label";
import { toast } from "@woben/ui/sonner";
import { cn } from "@woben/ui/utils";

export function SignupForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
	const router = useRouter();

	async function formAction(formData: FormData) {
		const name = formData.get("name");
		const email = formData.get("email");
		const password = formData.get("password");

		if (!name) throw new Error("name can not be empty");
		if (!email) throw new Error("email can not be empty");
		if (!password) throw new Error("password can not be empty");

		await authClient.signUp.email(
			{
				name: name.toString(),
				email: email.toString(),
				password: password.toString(),
			},
			{
				onError: (ctx) => {
					toast.error(ctx.error.message);
				},
			},
		);

		router.invalidate();
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Get started with Woben</CardTitle>
					<CardDescription>Create a new account</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={formAction}>
						<div className="grid gap-6">
							<div className="flex flex-col gap-4">
								<Button variant="outline" className="w-full">
									Continue with Google
								</Button>
							</div>
							<div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
								<span className="relative z-10 bg-background px-2 text-muted-foreground">or</span>
							</div>
							<div className="grid gap-6">
								<div className="grid gap-2">
									<Label htmlFor="name">Name</Label>
									<Input id="name" name="name" required />
								</div>
								<div className="grid gap-2">
									<Label htmlFor="email">Email</Label>
									<Input id="email" name="email" type="email" required />
								</div>
								<div className="grid gap-2">
									<div className="flex items-center">
										<Label htmlFor="password">Password</Label>
									</div>
									<Input id="password" name="password" type="password" required />
								</div>
								<Button type="submit" className="w-full">
									Sign Up
								</Button>
							</div>
							<div className="text-center text-sm">
								Already have an account?{" "}
								<Link to="/login" className="underline underline-offset-4">
									Sign in
								</Link>
							</div>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
