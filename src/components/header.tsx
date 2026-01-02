"use client";

import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import Logo from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import { useMemo, useState } from "react";
import {
  useScroll,
  useMotionValueEvent,
  motion,
  AnimatePresence,
} from "motion/react";
import { cn } from "@/lib/utils";
import type { Route } from "next";
import { MessageCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";

export default function Header() {
  const { data: session } = authClient.useSession();
  const canAccessDashboard =
    session?.user?.hasActiveSubscription || session?.user?.isAdmin;

  const links = useMemo(
    () => [
      {
        to: "/dashboard",
        label: "Dashboard",
        isPublic: false,
        requiresDashboardAccess: true,
      } as const,
      {
        to: "/pricing",
        label: "Pricing",
        isPublic: true,
        showWhenSubscribed: false,
      } as const,
      { to: "/events", label: "Events", isPublic: true } as const,
    ],
    [],
  );

  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  const filteredLinks = useMemo(
    () =>
      links.filter((link) => {
        if (
          "showWhenSubscribed" in link &&
          !link.showWhenSubscribed && 
          session?.user?.hasActiveSubscription
        ) {
          return false;
        }
        if (link.isPublic) return true;
        if (!session?.user) return false;
        if ("requiresDashboardAccess" in link && link.requiresDashboardAccess) {
          return canAccessDashboard;
        }
        return true;
      }),
    [links, session, canAccessDashboard],
  );

  return (
    <motion.header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-background/80 border-border/40 border-b py-3 shadow-sm backdrop-blur-xl"
          : "bg-transparent py-4 sm:py-5",
      )}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6">
        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mr-8"
          >
            <Logo />
          </motion.div>

          <div className="bg-muted/50 flex items-center gap-1 rounded-full py-1.5">
            {filteredLinks.map(({ to, label }, index) => (
              <motion.div
                key={to}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
              >
                <Link
                  href={to as Route}
                  className={cn(
                    "relative rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300",
                    "text-muted-foreground hover:text-foreground",
                    "hover:bg-muted",
                  )}
                >
                  {label}
                </Link>
              </motion.div>
            ))}
          </div>
        </nav>

        {/* Mobile Logo */}
        <motion.div
          className="md:hidden"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Logo />
        </motion.div>

        {/* Desktop Right Side */}
        <motion.div
          className="hidden items-center md:flex"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Unified Action Bar */}
          <div className="border-border/40 bg-card/80 flex items-center gap-1 rounded-full border p-1.5 shadow-sm backdrop-blur-sm">
            {session && (
              <>
                <Link
                  href={"/messages" as Route}
                  className={cn(
                    "relative flex size-9 items-center justify-center rounded-full",
                    "text-muted-foreground transition-all duration-200",
                    "hover:bg-primary/10 hover:text-primary",
                  )}
                >
                  <MessageCircle className="size-[18px]" />
                </Link>
                <div className="bg-border/50 mx-0.5 h-5 w-px" />
              </>
            )}
            <ModeToggle />
            <div className="bg-border/50 mx-0.5 h-5 w-px" />
            <UserMenu />
          </div>
        </motion.div>

        {/* Mobile Right Side */}
        <div className="flex items-center gap-2 md:hidden">
          {session && (
            <Link
              href={"/messages" as Route}
              className={cn(
                "relative flex size-9 items-center justify-center rounded-full",
                "border-border/40 bg-card/80 text-muted-foreground border",
                "hover:bg-primary/10 hover:text-primary transition-colors",
              )}
            >
              <MessageCircle className="size-[18px]" />
            </Link>
          )}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "relative size-10 rounded-full",
                  "hover:bg-muted/60 transition-colors",
                )}
                aria-label="Toggle menu"
              >
                <div className="flex flex-col items-center justify-center gap-1">
                  <motion.span
                    className="block h-0.5 w-5 origin-center rounded-full bg-current"
                    animate={{
                      rotate: mobileMenuOpen ? 45 : 0,
                      y: mobileMenuOpen ? 3 : 0,
                    }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <motion.span
                    className="block h-0.5 w-5 rounded-full bg-current"
                    animate={{
                      opacity: mobileMenuOpen ? 0 : 1,
                      scaleX: mobileMenuOpen ? 0 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                  />
                  <motion.span
                    className="block h-0.5 w-5 origin-center rounded-full bg-current"
                    animate={{
                      rotate: mobileMenuOpen ? -45 : 0,
                      y: mobileMenuOpen ? -3 : 0,
                    }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="bg-background/95 w-full border-none p-0 backdrop-blur-xl"
            >
              <div className="flex h-full flex-col">
                {/* Mobile Menu Header */}
                <SheetHeader className="border-border/40 border-b p-6">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="flex items-center justify-between">
                    <Logo />
                  </div>
                </SheetHeader>

                {/* Mobile Menu Content */}
                <nav className="flex flex-1 flex-col justify-center px-6">
                  <AnimatePresence>
                    {mobileMenuOpen && (
                      <div className="space-y-2">
                        {filteredLinks.map(({ to, label }, index) => (
                          <motion.div
                            key={to}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{
                              duration: 0.4,
                              delay: index * 0.1,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                          >
                            <Link
                              href={to as Route}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                "group flex items-center gap-4 rounded-2xl p-4",
                                "text-foreground/80 text-2xl font-semibold",
                                "hover:bg-primary/5 hover:text-foreground",
                                "transition-all duration-300",
                              )}
                            >
                              <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
                                <span className="text-lg font-bold">
                                  {label.charAt(0)}
                                </span>
                              </span>
                              <span>{label}</span>
                            </Link>
                          </motion.div>
                        ))}

                        {/* Divider */}
                        <motion.div
                          initial={{ opacity: 0, scaleX: 0 }}
                          animate={{ opacity: 1, scaleX: 1 }}
                          exit={{ opacity: 0, scaleX: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: filteredLinks.length * 0.1,
                          }}
                          className="via-border my-6 h-px bg-gradient-to-r from-transparent to-transparent"
                        />

                        {/* Actions */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{
                            duration: 0.4,
                            delay: filteredLinks.length * 0.1 + 0.1,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="flex items-center justify-center pt-4"
                        >
                          <div className="border-border/40 bg-card/80 flex items-center gap-1 rounded-full border p-1.5 shadow-sm">
                            <ModeToggle />
                            <div className="bg-border/50 mx-0.5 h-5 w-px" />
                            <UserMenu />
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </nav>

                {/* Mobile Menu Footer */}
                <div className="border-border/40 border-t p-6">
                  <p className="text-muted-foreground text-center text-sm">
                    © {new Date().getFullYear()} Eventifive
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
