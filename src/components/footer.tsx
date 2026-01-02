import Link from "next/link";
import { headers } from "next/headers";
import GoToTop from "./go-to-top";
import type { Route } from "next";
import {
  IconBrandTwitter,
  IconBrandLinkedin,
  IconBrandGithub,
  IconMail,
  IconMapPin,
  IconCalendarEvent,
} from "@tabler/icons-react";

const footerLinks = {
  product: {
    title: "Product",
    links: [
      { label: "Events", href: "/events" as Route },
      { label: "Pricing", href: "/pricing" as Route },
      { label: "Dashboard", href: "/dashboard" as Route },
    ],
  },
  resources: {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" as Route },
      { label: "Help Center", href: "#" as Route },
      { label: "API Reference", href: "#" as Route },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About Us", href: "#" as Route },
      { label: "Blog", href: "#" as Route },
      { label: "Contact", href: "#" as Route },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" as Route },
      { label: "Terms of Service", href: "#" as Route },
      { label: "Cookie Policy", href: "#" as Route },
    ],
  },
};

const socialLinks = [
  { icon: IconBrandTwitter, href: "#" as Route, label: "Twitter" },
  { icon: IconBrandLinkedin, href: "#" as Route, label: "LinkedIn" },
  { icon: IconBrandGithub, href: "#" as Route, label: "GitHub" },
];

export default async function Footer() {
  await headers();
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="border-border/40 bg-background relative border-t">
        {/* Main Footer Content */}
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-4">
              {/* Logo */}
              <Link href="/" className="inline-flex items-center gap-2">
                <div className="from-primary to-primary/80 shadow-primary/20 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg">
                  <IconCalendarEvent className="text-primary-foreground size-5" />
                </div>
                <span className="font-mono text-xl font-bold">
                  Eventi<span className="text-primary">Five</span>
                </span>
              </Link>

              {/* Tagline */}
              <p className="text-muted-foreground mt-4 max-w-xs text-sm leading-relaxed">
                The modern platform for organizing and discovering conferences,
                workshops, and professional events.
              </p>

              {/* Contact Info */}
              <div className="mt-6 space-y-3">
                <div className="text-muted-foreground flex items-center gap-3 text-sm">
                  <div className="bg-muted/50 flex size-8 items-center justify-center rounded-lg">
                    <IconMail className="size-4" />
                  </div>
                  <span>support@eventifive.com</span>
                </div>
                <div className="text-muted-foreground flex items-center gap-3 text-sm">
                  <div className="bg-muted/50 flex size-8 items-center justify-center rounded-lg">
                    <IconMapPin className="size-4" />
                  </div>
                  <span>Algeria</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-6 flex items-center gap-2">
                {socialLinks.map((social) => (
                  <Link
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="border-border/50 bg-card/80 text-muted-foreground hover:border-primary/30 hover:bg-primary/10 hover:text-primary flex size-9 items-center justify-center rounded-lg border transition-all duration-200"
                  >
                    <social.icon className="size-4" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Links Sections */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
              {Object.values(footerLinks).map((section) => (
                <div key={section.title}>
                  <h3 className="text-foreground text-sm font-semibold">
                    {section.title}
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-muted-foreground hover:text-primary text-sm transition-colors duration-200"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-border/40 border-t">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-muted-foreground text-sm">
                © {currentYear} EventiFive. All rights reserved.
              </p>

              <div className="flex items-center gap-6">
                <Link
                  href={"#" as Route}
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Privacy
                </Link>
                <Link
                  href={"#" as Route}
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Terms
                </Link>
                <Link
                  href={"#" as Route}
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative gradient */}
        <div className="via-primary/20 absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent" />
      </footer>
      <GoToTop />
    </>
  );
}
