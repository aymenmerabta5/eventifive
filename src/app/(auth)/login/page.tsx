"use client";

import { useState, Suspense } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SignInForm } from "@/app/(auth)/login/_components/SignInForm";
import { SignUpForm } from "@/app/(auth)/login/_components/SignUpForm";
import Loader from "@/components/loader";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [showSignIn, setShowSignIn] = useState<boolean>(true);

  return (
    <>
      {/* Return to home button - only on large screens with split layout */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute top-6 left-6 z-20 hidden lg:block"
      >
        <Link
          href="/"
          className="group border-border/50 bg-card/80 text-muted-foreground hover:border-primary/30 hover:bg-card hover:text-foreground flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium backdrop-blur-sm transition-all duration-200 hover:shadow-md"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back</span>
        </Link>
      </motion.div>

      {/* Form with animated transitions */}
      <AnimatePresence mode="wait">
        {showSignIn ? (
          <motion.div
            key="signin"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Suspense fallback={<Loader />}>
              <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
            </Suspense>
          </motion.div>
        ) : (
          <motion.div
            key="signup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Suspense fallback={<Loader />}>
              <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
