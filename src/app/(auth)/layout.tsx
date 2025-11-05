export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
		<div className="grid grid-rows-[1fr] h-svh">
			{children}
		</div>
		</>
	);
}
