import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Link,
	Preview,
	Tailwind,
	Text,
} from "@react-email/components";

interface Props {
	url: string;
	name: string;
}

export default function VerificationEmail({ url, name }: Props) {
	return (
		<Html>
			<Head />
			<Preview>
				Hello {name}, please help us verify your Woben account email address by clicking the button
				bellow.
			</Preview>
			<Tailwind>
				<Body className="mx-auto my-auto bg-white px-2 font-sans">
					<Container className="mx-auto my-10 max-w-[465px] rounded-md border border-[#eaeaea] border-solid px-5 py-3">
						<Heading className="my-5 text-center font-normal text-[24px]">
							Verify your email address
						</Heading>
						<Text>
							Hello {name}!<br />
							Please verify your email address by clicking the button below.
						</Text>
						<Button
							className="block rounded-md bg-blue-800 px-5 py-3 text-center text-[13px] text-white"
							href={url}
						>
							Verify Email
						</Button>
						<Text>
							Or, you can copy and paste the link below into your browser:
							<br />
							<Link href={url} className="break-all text-blue-700 no-underline">
								{url}
							</Link>
						</Text>
						<Text>If you didn&apos;t request for this, you can safely ignore this email.</Text>
						<Text>
							Thank you,
							<br />
							Quan from Woben
						</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
}

VerificationEmail.PreviewProps = {
	url: "http://localhost:3000/auth/verify-email?token=1234567890&callbackURL=/",
	name: "John Doe",
} as Props;
