import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FormFooter() {
  return (
    <div className="mt-6 text-center">
      <Button
        variant="link"
        asChild
        className="text-muted-foreground hover:text-primary h-auto p-0 text-sm"
      >
        <Link href="/login">Back to login</Link>
      </Button>
    </div>
  );
}
