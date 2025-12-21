import Link from "next/link";
import { headers } from "next/headers";
import GoToTop from "./go-to-top";

export default async function Footer() {
  await headers();
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="border-border bg-background w-full border-t px-4 py-2">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
            <div className="text-muted-foreground text-center text-sm md:text-left">
              © {currentYear} Eventify. All rights reserved.
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
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
