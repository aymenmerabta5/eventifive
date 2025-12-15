"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
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
  eventType: string;
  onSubmit?: (data: {
    name: string;
    email: string;
    researchDomain: string;
    aboutIdea: string;
    files: File[];
  }) => Promise<void>;
  isSubmitting?: boolean;
  uploadedCount?: number;
  isLoadingQuota?: boolean;
}

export default function JoinForm({
  eventId,
  eventType,
  onSubmit,
  isSubmitting: isSubmittingProp = false,
  uploadedCount: uploadedCountProp = 0,
  isLoadingQuota: isLoadingQuotaProp = false,
}: JoinFormProps) {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [researchDomain, setResearchDomain] = useState("");
  const [aboutIdea, setAboutIdea] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedCount, setUploadedCount] = useState(uploadedCountProp);
  const [isLoadingQuota, setIsLoadingQuota] = useState(isLoadingQuotaProp);
  const [isSubmitting, setIsSubmitting] = useState(isSubmittingProp);
  const [isDragOver, setIsDragOver] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const maxFiles = 3;
  const remainingSlots = Math.max(0, maxFiles - uploadedCount - files.length);
  const addMoreFiles = remainingSlots > 0;

  useEffect(() => {
    if (!user) return;

    setName(user.name ?? "");
    setEmail(user.email ?? "");
    setResearchDomain((user as { researchDomain?: string | null }).researchDomain ?? "");
    setAboutIdea("");
  }, [user]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setIsLoadingQuota(true);

    fetch(`/api/upload-file?eventId=${encodeURIComponent(eventId)}`)
      .then(async (response) => {
        const json = (await response.json()) as {
          uploadedCount?: number;
          maxFiles?: number;
          message?: string;
        };

        if (!response.ok) {
          throw new Error(json.message || "Failed to load upload quota");
        }

        return json;
      })
      .then((json) => {
        if (cancelled) return;
        setUploadedCount(Number(json.uploadedCount ?? 0));
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Error fetching upload quota:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load your remaining upload slots.",
        );
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoadingQuota(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventId, user]);

  const addFiles = (incoming: File[]) => {
    if (incoming.length === 0) return;

    setFiles((prev) => {
      const available = Math.max(0, maxFiles - uploadedCount - prev.length);
      if (available <= 0) return prev;

      const next = [...prev, ...incoming.slice(0, available)];
      if (incoming.length > available) {
        toast.error("You can upload a maximum of 3 files for this event.");
      }
      return next;
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!addMoreFiles) {
      toast.error("You can upload a maximum of 3 files.");
      event.target.value = "";
      return;
    }

    const selected = Array.from(event.target.files ?? []);
    addFiles(selected);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    if (!addMoreFiles) {
      toast.error("You can upload a maximum of 3 files.");
      return;
    }

    const dropped = Array.from(event.dataTransfer.files ?? []);
    addFiles(dropped);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const removeFileAt = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (name.trim().length === 0) {
      toast.error("Please enter your full name.");
      return;
    }

    if (files.length === 0) {
      toast.error("Please select at least 1 file to upload.");
      return;
    }

    if (uploadedCount + files.length > maxFiles) {
      toast.error("You can upload a maximum of 3 files for this event.");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to submit a registration.");
      return;
    }

    if (onSubmit) {
      await onSubmit({
        name,
        email,
        researchDomain,
        aboutIdea,
        files,
      });
      setFiles([]);
      return;
    }

    setIsSubmitting(true);

    try {
      const trimmedAboutIdea = aboutIdea.trim();

      for (const [index, file] of files.entries()) {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("eventId", eventId);
        if (index === 0) {
          formData.set("name", name);
          formData.set("researchDomain", researchDomain);
          if (trimmedAboutIdea.length > 0) {
            formData.set("aboutIdea", trimmedAboutIdea);
          }
        }

        const uploadResponse = await fetch("/api/upload-file", {
          method: "POST",
          body: formData,
        });

        const uploadJson = (await uploadResponse.json()) as {
          message?: string;
          fileId?: string;
          documentKey?: string;
          submissionId?: string;
        };

        if (!uploadResponse.ok) {
          throw new Error(uploadJson.message || "Failed to upload file.");
        }

        if (index === 0 && uploadJson.submissionId) {
          setSubmissionId(uploadJson.submissionId);
        }
      }

      toast.success("Your workshop application has been uploaded successfully.");
      setFiles([]);
      setUploadedCount((prev) => Math.min(maxFiles, prev + files.length));
    } catch (error) {
      console.error("Error during workshop registration upload:", error);
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
            Workshop Registration
          </Badge>
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Submit your application
          </h1>
          <p className="mx-auto max-w-xl text-balance text-muted-foreground">
            Share your details and upload your supporting file so we can review
            your application for the workshop.
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

              {/* About Your Idea */}
              <div className="space-y-2">
                <Label
                  htmlFor="aboutIdea"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <FlaskConical className="h-4 w-4 text-muted-foreground" />
                  About your idea
                </Label>
                <textarea
                  id="aboutIdea"
                  name="aboutIdea"
                  value={aboutIdea}
                  onChange={(event) => setAboutIdea(event.target.value)}
                  placeholder="Tell us about your workshop idea or research project..."
                  className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <p className="text-xs text-muted-foreground">
                  Share your vision, goals, and what participants will learn
                </p>
              </div>

              <Separator />

              {/* File Upload Area */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <FileUp className="h-4 w-4 text-muted-foreground" />
                  Supporting document
                </Label>
                <p className="text-xs text-muted-foreground">
                  {isLoadingQuota
                    ? "Checking upload limit…"
                    : `${uploadedCount}/${maxFiles} already uploaded for this event`}
                </p>

                {files.length === 0 ? (
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
                      or click to browse from your computer (max 3 files)
                    </p>
                    <Input
                      id="file"
                      name="file"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileChange}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                    <p className="mt-4 text-xs text-muted-foreground">
                      PDF, DOC, DOCX up to 10MB each
                    </p>
                  </div>
                ) : (
                  <Card className="bg-muted/30">
                    <CardContent className="space-y-3 p-4">
                      {files.map((file, index) => (
                        <div key={`${file.name}-${file.size}-${index}`} className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => removeFileAt(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {addMoreFiles ? (
                        <div className="relative flex items-center justify-center rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
                          <span>Add more files (up to 3)</span>
                          <Input
                            id="file-more"
                            name="file-more"
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleFileChange}
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                          />
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                )}
              </div>

              <CardFooter className="flex-col gap-4 px-0 pt-4 sm:flex-row sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  By submitting, you agree to our terms and conditions.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Button
                    type="submit"
                    className="w-full sm:w-auto sm:min-w-[200px]"
                    disabled={isSubmitting || files.length === 0}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Upply your Workshop
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


