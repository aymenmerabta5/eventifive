import Footer from "@/components/footer";
import Header from "@/components/header";

export default function AppLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="relative min-h-screen flex flex-col">
			
			<div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
				
				<div className="absolute inset-0 bg-background" />

			
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />

				
				<div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/20 blur-3xl" />
				<div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/15 blur-3xl" />
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-primary/10 blur-3xl" />

			
				<div
					className="absolute inset-0 opacity-[0.02]"
					style={{
						backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
					}}
				/>
			</div>


			<div className="relative z-10 flex min-h-screen flex-col">
				<Header />
				<main className="flex-1">{children}</main>
				<Footer />
			</div>
		</div>
	);
}

