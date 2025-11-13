import Link from "next/link";
import { headers } from "next/headers";
import GoToTop from "./go-to-top";

export default async function Footer() {
    await headers();
    const currentYear = new Date().getFullYear();
    
    return (
        <>
            <footer className="px-4 py-2 w-full border-t border-border bg-background">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
                        <div className="text-center text-sm text-muted-foreground md:text-left">
                            © {currentYear} Eventify. All rights reserved.
                        </div>
                        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm">
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
            <GoToTop />
        </>
    );
}
