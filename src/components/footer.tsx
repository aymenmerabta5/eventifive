import Link from "next/link";

export default function Footer() {
    return (
        <footer className="px-4 py-2 w-full border-t border-border bg-background">
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
                    <div className="text-center text-sm text-muted-foreground md:text-left">
                        © {new Date().getFullYear()} Eventify. All rights reserved.
                    </div>
                    <nav className="flex flex-wrap items-center justify-center gap-4 text-sm">
                        <Link
                            href="/"
                            className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Home
                        </Link>
                        <Link
                            href="/dashboard"
                            className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="#"
                            className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Privacy
                        </Link>
                        <Link
                            href="#"
                            className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Terms
                        </Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
}
