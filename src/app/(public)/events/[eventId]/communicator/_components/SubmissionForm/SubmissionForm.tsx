"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Clock, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";

import { useSubmissionForm } from "./hooks";
import {
  LoadingState,
  FormHeader,
  TitleField,
  AbstractField,
  KeywordsField,
  SubmissionTypeField,
  PersonalInfoFields,
  FileUploadArea,
  FormFooter,
} from "./components";
import type { SubmissionFormProps } from "./types";

export function SubmissionForm({ eventId, eventTitle }: SubmissionFormProps) {
  const {
    user,
    isPending,
    title,
    abstract,
    keywords,
    submissionType,
    name,
    email,
    files,
    hasSubmitted,
    existingSubmission,
    isCheckingStatus,
    isSubmitting,
    isDragOver,
    progress,
    titleLength,
    abstractLength,
    keywordsLength,
    maxTitleLength,
    maxAbstractLength,
    maxKeywordsLength,
    handleTitleChange,
    handleAbstractChange,
    handleKeywordsChange,
    handleSubmissionTypeChange,
    handleNameChange,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleRemoveFile,
    handleSubmit,
  } = useSubmissionForm({ eventId });

  // Loading state
  if (isPending || isCheckingStatus || !user) {
    return <LoadingState />;
  }

  // Already submitted state
  if (hasSubmitted && existingSubmission) {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl space-y-8">
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500/20 via-green-500/10 to-green-500/5 shadow-lg ring-1 shadow-green-500/10 ring-green-500/20">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Paper Already Submitted
            </h1>
            <p className="text-muted-foreground">
              You have already submitted a paper for this event.
            </p>
          </div>

          <Card className="border-border/50 from-card via-card to-card/80 bg-gradient-to-b shadow-xl">
            <CardContent className="p-6 sm:p-8">
              <div className="space-y-6">
                {/* Submission details */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                      <FileCheck className="text-primary h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-semibold">
                        {existingSubmission.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                            existingSubmission.status === "accepted"
                              ? "bg-green-500/10 text-green-600"
                              : existingSubmission.status === "rejected"
                                ? "bg-red-500/10 text-red-600"
                                : "bg-yellow-500/10 text-yellow-600",
                          )}
                        >
                          <Clock className="h-3 w-3" />
                          {existingSubmission.status === "draft"
                            ? "Under Review"
                            : existingSubmission.status
                                .charAt(0)
                                .toUpperCase() +
                              existingSubmission.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info alert */}
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Submission Received</AlertTitle>
                  <AlertDescription>
                    Your paper has been submitted and is being reviewed. You
                    will be notified when a decision is made.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header with staggered animation */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <FormHeader eventTitle={eventTitle} />
        </div>

        {/* Progress indicator */}
        <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards duration-700 [animation-delay:100ms]">
          <div className="mx-auto max-w-md space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">
                Form completion
              </span>
              <span className="text-primary font-semibold">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>

        {/* Main form card */}
        <Card
          className={cn(
            "animate-in fade-in slide-in-from-bottom-6 fill-mode-backwards duration-700 [animation-delay:200ms]",
            "border-border/50 relative overflow-hidden",
            "from-card via-card to-card/80 bg-gradient-to-b",
            "shadow-primary/5 shadow-xl",
            "backdrop-blur-sm",
          )}
        >
          {/* Decorative top gradient line */}
          <div className="via-primary/50 absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent" />

          {/* Subtle corner accent */}
          <div className="bg-primary/5 absolute -top-24 -right-24 h-48 w-48 rounded-full blur-2xl" />

          <CardContent className="relative p-6 sm:p-8 lg:p-10">
            <form onSubmit={handleSubmit} className="space-y-8" noValidate>
              {/* Section 1: Title */}
              <section className="animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards duration-500 [animation-delay:300ms]">
                <TitleField
                  title={title}
                  titleLength={titleLength}
                  onTitleChange={handleTitleChange}
                />
              </section>

              {/* Decorative divider */}
              <div className="flex items-center gap-4">
                <div className="via-border h-px flex-1 bg-gradient-to-r from-transparent to-transparent" />
                <div className="bg-primary/30 h-1.5 w-1.5 rounded-full" />
                <div className="via-border h-px flex-1 bg-gradient-to-l from-transparent to-transparent" />
              </div>

              {/* Section 2: Abstract */}
              <section className="animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards duration-500 [animation-delay:400ms]">
                <AbstractField
                  abstract={abstract}
                  abstractLength={abstractLength}
                  onAbstractChange={handleAbstractChange}
                />
              </section>

              {/* Decorative divider */}
              <div className="flex items-center gap-4">
                <div className="via-border h-px flex-1 bg-gradient-to-r from-transparent to-transparent" />
                <div className="bg-primary/30 h-1.5 w-1.5 rounded-full" />
                <div className="via-border h-px flex-1 bg-gradient-to-l from-transparent to-transparent" />
              </div>

              {/* Section 3: Type & Keywords */}
              <section className="animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards duration-500 [animation-delay:500ms]">
                <div className="grid gap-6 md:grid-cols-2">
                  <SubmissionTypeField
                    submissionType={submissionType}
                    onSubmissionTypeChange={handleSubmissionTypeChange}
                  />
                  <KeywordsField
                    keywords={keywords}
                    keywordsLength={keywordsLength}
                    onKeywordsChange={handleKeywordsChange}
                  />
                </div>
              </section>

              {/* Decorative divider */}
              <div className="flex items-center gap-4">
                <div className="via-border h-px flex-1 bg-gradient-to-r from-transparent to-transparent" />
                <div className="bg-primary/30 h-1.5 w-1.5 rounded-full" />
                <div className="via-border h-px flex-1 bg-gradient-to-l from-transparent to-transparent" />
              </div>

              {/* Section 4: Personal Info */}
              <section className="animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards duration-500 [animation-delay:600ms]">
                <PersonalInfoFields
                  name={name}
                  email={email}
                  onNameChange={handleNameChange}
                />
              </section>

              {/* Decorative divider */}
              <div className="flex items-center gap-4">
                <div className="via-border h-px flex-1 bg-gradient-to-r from-transparent to-transparent" />
                <div className="bg-primary/30 h-1.5 w-1.5 rounded-full" />
                <div className="via-border h-px flex-1 bg-gradient-to-l from-transparent to-transparent" />
              </div>

              {/* Section 5: File Upload */}
              <section className="animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards duration-500 [animation-delay:700ms]">
                <FileUploadArea
                  files={files}
                  isDragOver={isDragOver}
                  onFileChange={handleFileChange}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onRemoveFile={handleRemoveFile}
                />
              </section>

              {/* Footer */}
              <div className="animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards duration-500 [animation-delay:800ms]">
                <FormFooter
                  isSubmitting={isSubmitting}
                  hasFile={files.length > 0}
                  progress={progress}
                />
              </div>
            </form>
          </CardContent>

          {/* Decorative bottom gradient line */}
          <div className="via-primary/30 absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent to-transparent" />
        </Card>

        {/* Footer text */}
        <p className="animate-in fade-in fill-mode-backwards text-muted-foreground text-center text-xs duration-700 [animation-delay:900ms]">
          Need help? Contact our support team for assistance with your
          submission.
        </p>
      </div>
    </div>
  );
}
