"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { client } from "@/utils/orpc";
import { toast } from "sonner";

interface JoinFormProps {
  eventId: string;
}

export default function JoinForm({ eventId }: JoinFormProps) {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [researchDomain, setResearchDomain] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;

    setName(user.name ?? "");
    setEmail(user.email ?? "");
    setResearchDomain((user as any).researchDomain ?? "");
  }, [user]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to submit a registration.");
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadRequest = await client.files.requestUpload({
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
        eventId,
      });

      const uploadResponse = await fetch(uploadRequest.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file. Please try again.");
      }

      await client.files.confirmUpload({
        fileId: uploadRequest.fileId,
      });

      toast.success("Your registration file has been uploaded successfully.");
      setFile(null);
    } catch (error) {
      console.error("Error during registration upload:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while uploading your file.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPending || !user) {
    return (
      <div className="bg-gradient-to-b from-background via-muted/60 to-background flex min-h-screen items-center justify-center px-4">
        <p className="text-muted-foreground text-sm">
          Loading your information...
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-background via-muted/60 to-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(16,185,129,0.12),_transparent_55%)]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl space-y-8">
          <div className="space-y-3 text-center">
            <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Submit committee registration
            </h1>
            <p className="text-balance text-sm text-muted-foreground sm:text-base">
              Share your details and upload your supporting file so we can review your application for the committee.
            </p>
          </div>

          <Card className="border-border/60 bg-background/80 shadow-xl shadow-black/5 backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-base font-semibold">
                <span>Your information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit}
                className="space-y-6"
                noValidate
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      readOnly
                      className="bg-muted/60"
                    />
                    <p className="text-xs text-muted-foreground">
                      We&apos;ll use this email to contact you about your application.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="researchDomain">Research domain</Label>
                  <Input
                    id="researchDomain"
                    name="researchDomain"
                    type="text"
                    value={researchDomain}
                    onChange={(event) => setResearchDomain(event.target.value)}
                    placeholder="Your research domain or area of expertise"
                    autoComplete="organization-title"
                  />
                  <p className="text-xs text-muted-foreground">
                    Example: Artificial Intelligence, Human-Computer
                    Interaction, Data Science…
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">Upload supporting file</Label>
                  <Input
                    id="file"
                    name="file"
                    type="file"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {file && (
                    <p className="text-xs text-muted-foreground">
                      Selected file:{" "}
                      <span className="font-medium text-foreground">
                        {file.name}
                      </span>
                    </p>
                  )}
                  {!file && (
                    <p className="text-xs text-muted-foreground">
                      You can upload a publication list, or any relevant document.
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full sm:w-auto sm:min-w-[220px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit registration"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


