"use client";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import Logo from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import { useMemo, useState, Activity } from "react";
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
  const links = useMemo(
    () => [
      { to: "/dashboard", label: "Dashboard", isPublic: false } as const,
      { to: "/pricing", label: "Pricing", isPublic: true } as const,
      { to: "/events", label: "Events", isPublic: true } as const,
    ],
    [],
  );
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 60);
  });

  const filteredLinks = useMemo(
    () => links.filter(({ isPublic }) => (isPublic ? true : session?.user)),
    [links, session],
  );
  return (
    <motion.header
      className={cn(
        "sticky top-0 z-50 py-5 transition-all duration-300",
        isScrolled
          ? "bg-background/70 border-border/50 border-b shadow-lg shadow-black/5 backdrop-blur-xl"
          : "bg-transparent",
      )}
      style={
        isScrolled
          ? {
              boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.1)",
            }
          : {}
      }
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
       
        <nav className="hidden items-center gap-8 text-lg md:flex">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Logo />
          </motion.div>
          {filteredLinks.map(({ to, label }, index) => {
            return (
              <motion.div
                key={to}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              >
                <Link
                  href={to as Route}
                  className="after:bg-primary relative after:absolute after:top-8 after:bottom-0 after:left-0 after:h-[3px] after:w-full after:origin-left after:scale-x-0 after:transition-transform after:duration-300 after:ease-in-out after:content-[''] hover:after:scale-x-100"
                >
                  {label}
                </Link>
              </motion.div>
            );
          })}
        </nav>

    
        <motion.div
          className="md:hidden"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Logo />
        </motion.div>

   
        <motion.div
          className="hidden items-center gap-3 md:flex"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Activity mode={session ? "visible" : "hidden"}>
            <Link
              href={"/messages" as Route}
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full p-5.5")}
            >
				<MessageCircle className="size-5" />
			</Link>
          </Activity>

          <ModeToggle />
          <UserMenu />
        </motion.div>

       
        <div className="flex items-center gap-2 md:hidden">
          <Activity mode={session ? "visible" : "hidden"}>
            <Link
              href={"/messages" as Route}
              className="text-muted-foreground bg-muted/70 hover:bg-muted/70 cursor-pointer rounded-full p-3 transition-colors"
            >
				<MessageCircle className="size-5" />
			</Link>
          </Activity>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative size-10"
                aria-label="Toggle menu"
              >
                <div className="flex flex-col items-center justify-center">
                  <motion.span
                    className="absolute h-0.5 w-5 rounded-full bg-current"
                    animate={{
                      rotate: mobileMenuOpen ? 45 : 0,
                      y: mobileMenuOpen ? 0 : -4,
                    }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  />
                  <motion.span
                    className="absolute h-0.5 w-5 rounded-full bg-current"
                    animate={{
                      opacity: mobileMenuOpen ? 0 : 1,
                      scaleX: mobileMenuOpen ? 0 : 1,
                    }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  />
                  <motion.span
                    className="absolute h-0.5 w-5 rounded-full bg-current"
                    animate={{
                      rotate: mobileMenuOpen ? -45 : 0,
                      y: mobileMenuOpen ? 0 : 4,
                    }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  />
                </div>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-background/95 h-full w-full border-none p-0 backdrop-blur-xl"
            >
              <div className="flex h-full flex-col">
                <SheetHeader className="p-6 pb-0">
                  <SheetTitle className="sr-only text-left">Menu</SheetTitle>
                  <div className="flex items-center justify-between">
                    <Logo />
                   
                  </div>
                </SheetHeader>
                <nav className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
                  <AnimatePresence>
                    {mobileMenuOpen && (
                      <>
                        {filteredLinks.map(({ to, label }, index) => (
                          <motion.div
                            key={to}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{
                              duration: 0.4,
                              delay: index * 0.1,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                          >
                            <Link
                              href={to as Route}
                              onClick={() => setMobileMenuOpen(false)}
                              className="group text-foreground/80 hover:text-foreground relative text-4xl font-bold tracking-tight transition-colors"
                            >
                              <span className="relative z-10">{label}</span>
                              <motion.span className="bg-primary absolute -bottom-2 left-0 h-1 w-0 rounded-full transition-all duration-300 ease-out group-hover:w-full" />
                            </Link>
                          </motion.div>
                        ))}

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{
                            duration: 0.4,
                            delay: filteredLinks.length * 0.1,
                            ease: "easeOut",
                          }}
                          className="mt-8 flex items-center gap-6"
                        >
                          <ModeToggle />
                          <UserMenu />
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </nav>

                <div className="text-muted-foreground p-6 text-center text-sm">
                  © {new Date().getFullYear()} Eventifive. All rights reserved.
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
