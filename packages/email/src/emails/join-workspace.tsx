import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Link,
	Preview,
	Tailwind,
	Text,
} from "@react-email/components";

interface Props {
	inviteLink: string;
	inviterName: string;
	workspaceName: string;
}

export default function JoinWorkspace({ inviteLink, inviterName, workspaceName }: Props) {
	return (
		<Html>
			<Head />
			<Preview>
				{inviterName} just send you an invitation to join {workspaceName} on Hoalu.
			</Preview>
			<Tailwind>
				<Body className="mx-auto my-auto bg-white px-2 font-sans">
					<Container className="mx-auto my-10 max-w-[465px] border border-[#eaeaea] border-solid px-5 py-3">
						<Heading className="my-5 text-center font-normal text-[24px]">
							Join <strong>{inviterName}</strong> on <strong>{workspaceName}</strong>
						</Heading>
						<Text>Hello there,</Text>
						<Text>
							<strong>{inviterName}</strong> has invited you to <strong>{workspaceName}</strong> on{" "}
							<strong>Hoalu</strong>.
						</Text>
						<Button
							className="block bg-blue-800 px-5 py-3 text-center text-[13px] text-white"
							href={inviteLink}
						>
							Accept
						</Button>
						<Text>
							Or, you can copy and paste the link below into your browser:
							<br />
							<Link href={inviteLink} className="text-blue-700">
								{inviteLink}
							</Link>
						</Text>
						<Text>
							Cheers,
							<br />
							Quan from Hoalu
						</Text>
						<Hr className="mx-0 my-[20px] w-full border border-[#eaeaea] border-solid" />
						<Text className="text-[#666666] text-[12px] leading-[20px]">
							If you were not expecting this invitation, you can ignore this email. If you are
							concerned about your account's safety, please reply to this email to get in touch with
							us.
						</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
}

JoinWorkspace.PreviewProps = {
	inviteLink: "http://localhost:5173/invite/QTQSloUSgwq3eTRs1qxhon23z5xbii4Q/accept",
	inviterName: "Quan Pham",
	workspaceName: "Hoalu Labs",
} as Props;
