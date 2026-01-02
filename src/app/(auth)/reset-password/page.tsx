"use client";

import { Suspense } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ResetPasswordForm } from "./_components/ResetPasswordForm";
import Loader from "@/components/loader";

export default function ResetPasswordPage() {
  return (
    <>
      {/* Return to login button - only on large screens */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute top-6 left-6 z-20 hidden lg:block"
      >
        <Link
          href="/login"
          className="group border-border/50 bg-card/80 text-muted-foreground hover:border-primary/30 hover:bg-card hover:text-foreground flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium backdrop-blur-sm transition-all duration-200 hover:shadow-md"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to login</span>
        </Link>
      </motion.div>

      <Suspense fallback={<Loader />}>
        <ResetPasswordForm />
      </Suspense>
    </>
  );
}
