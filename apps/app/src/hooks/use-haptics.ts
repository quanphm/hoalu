import { useWebHaptics } from "web-haptics/react";

export function useHaptics() {
	const haptics = useWebHaptics();

	return {
		trigger: (type?: Parameters<typeof haptics.trigger>[0]) => haptics.trigger(type),
		success: () => haptics.trigger("success"),
		error: () => haptics.trigger("error"),
		warning: () => haptics.trigger("warning"),
		light: () => haptics.trigger("light"),
		medium: () => haptics.trigger("medium"),
		heavy: () => haptics.trigger("heavy"),
		selection: () => haptics.trigger("selection"),
	};
}
