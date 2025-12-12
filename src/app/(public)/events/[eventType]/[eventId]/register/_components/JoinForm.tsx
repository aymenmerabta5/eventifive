"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { client } from "@/utils/orpc";
import { toast } from "sonner";
import {
  User,
  Mail,
  FlaskConical,
  FileUp,
  CheckCircle2,
  Loader2,
  FileText,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (!user) return;

    setName(user.name ?? "");
    setEmail(user.email ?? "");
    setResearchDomain((user as { researchDomain?: string | null }).researchDomain ?? "");
  }, [user]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const droppedFile = event.dataTransfer.files?.[0] ?? null;
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const clearFile = () => {
    setFile(null);
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
          : "An unexpected error occurred while uploading your file."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPending || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header Section */}
        <div className="space-y-4 text-center">
          <Badge variant="secondary" className="px-4 py-1.5">
            <FileUp className="mr-2 h-3.5 w-3.5" />
            Committee Registration
          </Badge>
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Submit your application
          </h1>
          <p className="mx-auto max-w-xl text-balance text-muted-foreground">
            Share your details and upload your supporting file so we can review
            your application for the committee.
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="border-border/60 shadow-xl backdrop-blur">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Your Information</CardTitle>
                <CardDescription>
                  Please verify your details below
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Personal Info Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    Full name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email
                    <Badge variant="outline" className="ml-auto text-[10px]">
                      Verified
                    </Badge>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    readOnly
                    className="h-11 bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    We&apos;ll use this email to contact you about your
                    application.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Research Domain */}
              <div className="space-y-2">
                <Label
                  htmlFor="researchDomain"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <FlaskConical className="h-4 w-4 text-muted-foreground" />
                  Research domain
                </Label>
                <Input
                  id="researchDomain"
                  name="researchDomain"
                  type="text"
                  value={researchDomain}
                  onChange={(event) => setResearchDomain(event.target.value)}
                  placeholder="Your research domain or area of expertise"
                  autoComplete="organization-title"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Example: Artificial Intelligence, Human-Computer Interaction,
                  Data Science…
                </p>
              </div>

              <Separator />

              {/* File Upload Area */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <FileUp className="h-4 w-4 text-muted-foreground" />
                  Supporting document
                </Label>

                {!file ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={cn(
                      "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all",
                      isDragOver
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/30"
                    )}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <FileUp className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="mt-4 text-sm font-medium">
                      Drag and drop your file here
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      or click to browse from your computer
                    </p>
                    <Input
                      id="file"
                      name="file"
                      type="file"
                      onChange={handleFileChange}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                    <p className="mt-4 text-xs text-muted-foreground">
                      PDF, DOC, DOCX up to 10MB
                    </p>
                  </div>
                ) : (
                  <Card className="bg-muted/30">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-sm">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-green-500/10 text-green-600"
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Ready
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={clearFile}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <CardFooter className="flex-col gap-4 px-0 pt-4 sm:flex-row sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  By submitting, you agree to our terms and conditions.
                </p>
                <Button
                  type="submit"
                  className="w-full sm:w-auto sm:min-w-[200px]"
                  disabled={isSubmitting || !file}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Submit application
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


