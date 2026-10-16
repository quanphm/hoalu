import { CaretDownIcon, KeyIcon, SignOutIcon } from "@hoalu/icons/phosphor";
import { GithubIcon, TwitterXIcon } from "@hoalu/icons/social";
import { SettingsIcon } from "@hoalu/icons/tabler";
import { Button } from "@hoalu/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@hoalu/ui/dropdown-menu";
import { Link } from "@tanstack/react-router";

import { UserAvatar } from "#app/components/user-avatar.tsx";
import { KEYBOARD_SHORTCUTS } from "#app/helpers/constants.ts";
import { useAuth } from "#app/hooks/use-auth.ts";

/**
 * The account menu in the top bar. Also the last home for the version string and
 * the repository links, which used to sit in the sidebar's footer.
 */
export function NavUser() {
	const { user, signOut } = useAuth();

	if (!user) return null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button variant="ghost" className="gap-2 pl-1.5" aria-label="Account menu">
						<UserAvatar name={user.name} image={user.image} className="size-6" />
						<span className="hidden max-w-40 truncate font-medium lg:inline">{user.name}</span>
						<CaretDownIcon className="text-faint" />
					</Button>
				}
			/>
			<DropdownMenuContent className="min-w-56 rounded-lg" align="end" sideOffset={6}>
				<div className="flex items-center gap-2 px-2 py-1.5">
					<UserAvatar name={user.name} image={user.image} className="size-6" />
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-semibold">{user.name}</span>
						<span className="text-faint truncate text-xs">{user.email}</span>
					</div>
				</div>

				<DropdownMenuSeparator />

				<DropdownMenuGroup>
					<DropdownMenuItem
						render={
							<Link
								to="/account/preferences"
								disabled={!KEYBOARD_SHORTCUTS.goto_preferences.enabled}
							/>
						}
					>
						<SettingsIcon />
						Preferences
					</DropdownMenuItem>
					<DropdownMenuItem
						render={
							<Link to="/account/tokens" disabled={!KEYBOARD_SHORTCUTS.goto_tokens.enabled} />
						}
					>
						<KeyIcon />
						Access tokens
					</DropdownMenuItem>
				</DropdownMenuGroup>

				<DropdownMenuSeparator />

				<DropdownMenuGroup>
					<DropdownMenuItem
						render={
							<a
								href="https://github.com/quanphm/hoalu"
								target="_blank"
								rel="noreferrer"
								aria-label="Hoalu on GitHub"
							/>
						}
					>
						<GithubIcon />
						GitHub
					</DropdownMenuItem>
					<DropdownMenuItem
						render={
							<a
								href="https://x.com/quanphmm"
								target="_blank"
								rel="noreferrer"
								aria-label="Quan Pham on X"
							/>
						}
					>
						<TwitterXIcon />
						Follow along
					</DropdownMenuItem>
				</DropdownMenuGroup>

				<DropdownMenuSeparator />

				<div className="flex items-center justify-between px-2 py-1.5">
					<span className="text-faint font-mono text-xs leading-none tracking-tight">
						{import.meta.env.PUBLIC_APP_VERSION}
					</span>
					<span className="text-faint text-xs leading-none">HoaLu</span>
				</div>

				<DropdownMenuSeparator />

				<DropdownMenuItem onClick={() => signOut()}>
					<SignOutIcon />
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
