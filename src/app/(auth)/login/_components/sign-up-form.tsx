import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";
import Loader from "../../../../components/loader";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { useRouter } from "next/navigation";
import { Card } from "../../../../components/ui/card";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import Turnstile, { useTurnstile } from "react-turnstile";
import { env } from "@/env";
import { useState, useTransition, Activity } from "react";
import { SiGoogle } from "@icons-pack/react-simple-icons";
import { Button as StatefulButton } from "../../../../components/ui/stateful-button";
import { Loader2 } from "lucide-react";
import { signUpSchema } from "@/lib/schemas/schemas";

export default function SignUpForm({
  onSwitchToSignIn,
}: {
  onSwitchToSignIn: () => void;
}) {

  const [token, setToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [isPendingSocial, startTransitionSocial] = useTransition();
  const { isPending: isSessionPending } = authClient.useSession();
  const turnstile = useTurnstile();
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      if (!token) {
        toast.error("Please solve the captcha");
        return;
      }
        await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
          fetchOptions: {
            headers: {
              "x-captcha-response": token || "",
            },
          },
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
            toast.success("Sign up successful");
          },
          onError: () => {
            toast.error("An error occurred while signing up");
            turnstile?.reset();
            setToken(null);
          },
        },
      );
  },
    validators: {
      onSubmit: signUpSchema,
    },
  });

  if (isSessionPending) {
    return <Loader />;
  }

  return (
    <div className="flex mt-12 items-center justify-center p-4">
      <div className="relative w-full max-w-lg">
        <div
          className="absolute inset-0 -z-10 rounded-xl opacity-10 blur-3xl dark:opacity-40"
          style={{
            background: "oklch(var(--primary))",
            transform: "scale(1.15)",
          }}
        />
        <Card className="border-primary/20 dark:border-primary/40 bg-card/95 relative w-full p-8 shadow-lg backdrop-blur-md dark:shadow-[0_0_60px_rgba(139,92,246,0.5),0_0_120px_rgba(139,92,246,0.3),0_25px_80px_rgba(0,0,0,0.2),0_10px_30px_rgba(0,0,0,0.3)]">
          <div className="mb-5 flex flex-col items-center">
            <UserPlus className="text-primary mb-2 size-8" />
            <h1 className="text-foreground font-display text-3xl font-semibold tracking-tight">
              Create Account
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Sign up to get started
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
            <form.Field name="name">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="text-sm font-medium">
                    Name
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="h-11"
                    placeholder="Enter your name"
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
                  <div className="relative">
                    <Input
                      id={field.name}
                      name={field.name}
                      type={showPassword ? "text" : "password"}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="h-11 pr-10"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
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
                  toast.error("Please solve the captcha");
                  turnstile?.reset();
                  setToken(null);
                }}
              />
            </div>

            <form.Subscribe>
              {(state) => (
                  <StatefulButton
                    type="submit"
                    className="mt-3 h-11 w-full rounded-4xl"
                    disabled={!state.canSubmit || state.isSubmitting}
                  >
                    {state.isSubmitting ? "Signing up..." : "Sign Up"}
                  </StatefulButton>
              )}
            </form.Subscribe>
          </form>
          <div className="relative my-3">
            <hr className="border-border" />
            <span className="bg-card text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-sm">
              Or
            </span>
          </div>
          <Button
            variant="outline"
            className="rounded-3xl px-4"
            onClick={() =>
              startTransitionSocial(async () => {
                await authClient.signIn.social(
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
            })}
          >
            <Activity mode={isPendingSocial ? "visible" : "hidden"}>
              <Loader2 className="animate-spin size-4" />
            </Activity>
            <Activity mode={isPendingSocial ? "hidden" : "visible"}>
              <SiGoogle className="me-3" />
            </Activity>
            Sign in with Google
          </Button>

          <div className="space-y-3 text-center">
            <Button
              variant="link"
              onClick={onSwitchToSignIn}
              className="text-muted-foreground hover:text-primary h-auto p-0 text-sm"
            >
              Already have an account?{" "}
              <span className="text-primary font-medium">Sign In</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
