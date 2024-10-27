import { useEffect, useImperativeHandle, useRef } from "react";

export const useAutoResizeTextarea = (
	ref: React.ForwardedRef<HTMLTextAreaElement>,
	autoResize: boolean,
) => {
	const textAreaRef = useRef<HTMLTextAreaElement>(null);

	useImperativeHandle(ref, () => textAreaRef.current!);

	useEffect(() => {
		const controller = new AbortController();
		const ref = textAreaRef?.current;
		const updateTextareaHeight = () => {
			if (ref && autoResize) {
				ref.style.height = "auto";
				ref.style.height = `${ref?.scrollHeight}px`;
			}
		};

		updateTextareaHeight();
		ref?.addEventListener("input", updateTextareaHeight, {
			signal: controller.signal,
		});

		return () => {
			controller.abort();
		};
	}, [autoResize]);

	return { textAreaRef };
};
