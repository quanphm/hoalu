import { createLink, type LinkComponent } from "@tanstack/react-router";

import { Button, type ButtonProps } from "@hoalu/ui/button";

const ButtonLinkComponent = (props: ButtonProps) => {
	return <Button {...props} />;
};

const CreatedButtonLinkComponent = createLink(Button);

export const ButtonLink: LinkComponent<typeof ButtonLinkComponent> = (props) => {
	return <CreatedButtonLinkComponent preload="intent" {...props} />;
};
