import Footer from "@/components/footer";
import Header from "@/components/header";

export default function AppLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<main className="flex-1">
				{children}
			</main>
			<Footer/>
		</div>
	);
}

