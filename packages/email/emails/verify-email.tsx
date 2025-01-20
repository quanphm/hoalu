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

export const VerifyEmail = ({ url, name }: Props) => (
	<Html>
		<Head />
		<Preview>[Woben] Please verify your email address</Preview>
		<Tailwind>
			<Body className="mx-auto my-auto bg-white px-2 font-sans">
				<Container className="mx-auto my-10 max-w-[465px] rounded border border-[#eaeaea] border-solid px-5 py-3">
					<Heading className="mx-0 my-5 p-0 text-center font-normal text-[24px] text-black">
						Verify your email address
					</Heading>
					<Text className="text-black leading-6">
						Hello {name}!<br />
						Please verify your email address by clicking the button below.
					</Text>
					<Button
						className="block rounded bg-blue-700 px-5 py-3 text-center text-[13px] text-white no-underline"
						href={url}
					>
						Verify Email
					</Button>
					<Text className="text-black leading-6">
						Or, you can copy and paste the link below into your browser:
						<br />
						<Link href={url} className="break-all text-blue-700 no-underline">
							{url}
						</Link>
					</Text>
					<Text className="text-black leading-6">
						If you didn&apos;t request for this, you can safely ignore this email.
					</Text>
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

VerifyEmail.PreviewProps = {
	url: "http://localhost:3000/auth/verify-email?token=eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6Im1pa3VuMTk5M0BnbWFpbC5jb20iLCJpYXQiOjE3MzcyOTY1NTUsImV4cCI6MTczNzMwMDE1NX0.VHHnxKiJhbLYm17QJhFp_cnobzLEVwrjVcZMxXZAovE&callbackURL=/",
	name: "QP",
} as Props;

export default VerifyEmail;
