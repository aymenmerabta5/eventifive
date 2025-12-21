import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

export default function ReturnBack() {
  return (
    <Link
      href="/"
      className={cn(
        buttonVariants({ variant: "default" }),
        "absolute top-4 left-4",
      )}
    >
      <ArrowLeft className="size-4" />
    </Link>
  );
}
