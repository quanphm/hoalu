import { render } from "@react-email/render";
import { APIError } from "better-auth/api";
import type { JSX } from "react";

export async function sendEmail({
	to,
	subject,
	react,
}: {
	from?: string;
	to: string;
	subject: string;
	react: JSX.Element;
}) {
	const html = await render(react);
	const response = await fetch("https://api.useplunk.com/v1/send", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${process.env.PLUNK_SECRET_KEY}`,
		},
		body: JSON.stringify({
			to,
			subject,
			body: html,
		}),
	});

	if (response.status === 200) {
		console.log("Email sent");
	} else {
		throw new APIError("BAD_REQUEST", {
			message: "Error while sending email.",
		});
	}
	return response;
}
