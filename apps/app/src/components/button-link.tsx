import { createLink, type LinkComponent } from "@tanstack/react-router";

import { Button, type ButtonProps } from "@hoalu/ui/button";

const CreatedButtonLinkComponent = createLink(Button);

export const ButtonLink: LinkComponent<ButtonProps> = (props) => {
	return <CreatedButtonLinkComponent preload="intent" {...props} />;
};
