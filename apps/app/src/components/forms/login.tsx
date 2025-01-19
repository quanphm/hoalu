import { authClient } from "@/lib/auth-client";
import { Link } from "@tanstack/react-router";
import { Button } from "@woben/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@woben/ui/card";
import { Input } from "@woben/ui/input";
import { Label } from "@woben/ui/label";
import { toast } from "@woben/ui/sonner";
import { cn } from "@woben/ui/utils";

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
	async function formAction(formData: FormData) {
		const email = formData.get("email");
		const password = formData.get("password");

		if (!email) throw new Error("email can not be empty");
		if (!password) throw new Error("password can not be empty");

		await authClient.signIn.email(
			{
				email: email.toString(),
				password: password.toString(),
				callbackURL: "/",
				rememberMe: true,
			},
			{
				onError: (ctx) => {
					toast.error(ctx.error.message);
				},
			},
		);
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Welcome back</CardTitle>
					<CardDescription>Sign in to your Woben account</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={formAction}>
						<div className="grid gap-6">
							<div className="flex flex-col gap-4">
								<Button variant="outline" className="w-full" tabIndex={1}>
									Continue with Google
								</Button>
							</div>
							<div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
								<span className="relative z-10 bg-background px-2 text-muted-foreground">or</span>
							</div>
							<div className="grid gap-6">
								<div className="grid gap-2">
									<Label htmlFor="email">Email</Label>
									<Input id="email" name="email" type="email" required tabIndex={2} />
								</div>
								<div className="grid gap-2">
									<Label htmlFor="password">Password</Label>
									<Input id="password" name="password" type="password" required tabIndex={3} />
									<Link
										to="/"
										preload={false}
										className="-mt-1 text-sm underline-offset-4 hover:underline"
										tabIndex={5}
									>
										Forgot password?
									</Link>
								</div>
								<Button type="submit" className="w-full" tabIndex={4}>
									Sign In
								</Button>
							</div>
							<div className="text-center text-sm">
								Don&apos;t have an account?{" "}
								<Link to="/signup" className="underline underline-offset-4">
									Sign up
								</Link>
							</div>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
