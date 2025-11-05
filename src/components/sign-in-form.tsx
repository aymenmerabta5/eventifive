import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";
import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useRouter } from "next/navigation";
import { Card } from "./ui/card";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { SiGoogle } from "@icons-pack/react-simple-icons";
import Turnstile, { useTurnstile } from "react-turnstile";
import { env } from "@/env";
import { useState } from "react";

export default function SignInForm({
  onSwitchToSignUp,
}: {
  onSwitchToSignUp: () => void;
}) {
  const [token, setToken] = useState<string | null>(null);
  const turnstile = useTurnstile();
  const router = useRouter();
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      if (!token) {
        toast.error("Please solve the captcha");
        return;
      }
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
          fetchOptions: {
            headers: {
              "x-captcha-response": token ?? "",
            },
          },
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
            toast.success("Sign in successful");
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onError: (error: any) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="relative w-full max-w-lg">
        <div
          className="absolute inset-0 -z-10 rounded-xl opacity-10 blur-3xl dark:opacity-40"
          style={{
            background: "oklch(var(--primary))",
            transform: "scale(1.15)",
          }}
        />
        <Card className="border-primary/20 dark:border-primary/40 bg-card/95 relative w-full p-8 shadow-lg backdrop-blur-md dark:shadow-[0_0_60px_rgba(139,92,246,0.5),0_0_120px_rgba(139,92,246,0.3),0_25px_80px_rgba(0,0,0,0.2),0_10px_30px_rgba(0,0,0,0.3)]">
          <div className="mb-8 flex flex-col items-center">
            <LogIn className="text-primary mb-3 size-8" />
            <h1 className="text-foreground font-display text-3xl font-semibold tracking-tight">
              Welcome Back
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Sign in to your account
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-5"
          >
            <form.Field name="email">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="h-11"
                    placeholder="Enter your email"
                  />
                  {field.state.meta.errors.map((error) => (
                    <p
                      key={error?.message}
                      className="text-destructive text-sm"
                    >
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="text-sm font-medium">
                    Password
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="h-11"
                    placeholder="Enter your password"
                  />
                  {field.state.meta.errors.map((error) => (
                    <p
                      key={error?.message}
                      className="text-destructive text-sm"
                    >
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>

            <div className="flex justify-center">
              <Turnstile
                sitekey={env.NEXT_PUBLIC_CLOUDFLARE_TURNSTYLE_PK}
                onVerify={(token) => {
                  setToken(token);
                }}
                onError={() => {
                  turnstile.reset();
                  setToken(null);
                }}
              />
            </div>

            <form.Subscribe>
              {(state) => (
                <Button
                  type="submit"
                  className="mt-6 h-11 w-full rounded-4xl"
                  disabled={!state.canSubmit || state.isSubmitting}
                >
                  {state.isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
              )}
            </form.Subscribe>
          </form>
          <div className="relative my-6">
            <hr className="border-border" />
            <span className="bg-card text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-sm">
              Or
            </span>
          </div>

          <Button
            variant="outline"
            className="rounded-3xl px-4"
            onClick={() =>
              authClient.signIn.social(
                {
                  provider: "google",
                },
                {
                  onSuccess: () => {
                    router.push("/dashboard");
                  },
                  onError: (error) => {
                    toast.error(error.error.message || error.error.statusText);
                  },
                },
              )
            }
          >
            <SiGoogle className="me-3" />
            Sign in with Google
          </Button>

          <div className="space-y-3 text-center">
            <Button
              variant="link"
              onClick={onSwitchToSignUp}
              className="text-muted-foreground hover:text-primary h-auto p-0 text-sm"
            >
              Don&apos;t have an account?{" "}
              <span className="text-primary font-medium">Sign Up</span>
            </Button>

            <Button
              variant="link"
              asChild
              className="text-muted-foreground hover:text-primary block h-auto p-0 text-sm"
            >
              <Link href="/reset-password">Forgot password?</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
