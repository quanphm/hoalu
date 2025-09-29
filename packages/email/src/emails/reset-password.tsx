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

export default function ResetPassword({ url, name }: Props) {
	return (
		<Html>
			<Head />
			<Preview>Reset your password. Clicking the link bellow.</Preview>
			<Tailwind>
				<Body className="mx-auto my-auto bg-white px-2 font-sans">
					<Container className="mx-auto my-10 max-w-[465px] border border-[#eaeaea] border-solid px-5 py-3">
						<Heading className="my-5 text-center font-normal text-[24px]">Reset password</Heading>
						<Text>
							Hello <strong>{name}</strong>,
						</Text>
						<Text>Reset your password by clicking the button below.</Text>
						<Button
							className="block bg-blue-800 px-5 py-3 text-center text-[13px] text-white"
							href={url}
						>
							Reset Password
						</Button>
						<Text>
							Or, you can copy and paste the link below into your browser:
							<br />
							<Link href={url} className="text-blue-700">
								{url}
							</Link>
						</Text>
						<Text>If you didn&apos;t request for this, you can safely ignore this email.</Text>
						<Text>
							Cheers,
							<br />
							Quan from Hoalu
						</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
}

ResetPassword.PreviewProps = {
	url: "http://localhost:5173/reset-password?token=1234567890",
	name: "John Doe",
} as Props;
