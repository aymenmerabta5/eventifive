"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import { useWorkshopForm } from "./hooks";
import {
  LoadingState,
  FormHeader,
  WorkshopTitleField,
  PersonalInfoFields,
  ResearchDomainField,
  WorkshopDescriptionField,
  CapacityField,
  FileUploadArea,
  FormFooter,
} from "./components";
import type { WorkshopFormProps } from "./types";

export function WorkshopForm({ eventId, eventType }: WorkshopFormProps) {
  const {
    user,
    isPending,
    workshopTitle,
    name,
    email,
    researchDomain,
    description,
    capacity,
    files,
    uploadedCount,
    isLoadingQuota,
    isSubmitting,
    isDragOver,
    canAddMoreFiles,
    maxFiles,
    handleWorkshopTitleChange,
    handleNameChange,
    handleResearchDomainChange,
    handleDescriptionChange,
    handleCapacityChange,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleRemoveFile,
    handleSubmit,
  } = useWorkshopForm({ eventId });

  // Calculate form progress
  const calculateProgress = () => {
    let filled = 0;
    const total = 5;
    if (workshopTitle.trim()) filled++;
    if (name.trim()) filled++;
    if (researchDomain.trim()) filled++;
    if (description.trim()) filled++;
    if (files.length > 0) filled++;
    return (filled / total) * 100;
  };

  // Loading state
  if (isPending || !user) {
    return <LoadingState />;
  }

  const progress = calculateProgress();

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header with staggered animation */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <FormHeader />
        </div>

        {/* Progress indicator */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 [animation-delay:100ms] fill-mode-backwards">
          <div className="mx-auto max-w-md space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Form completion</span>
              <span className="font-semibold text-primary">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>

        {/* Main form card */}
        <Card
          className={cn(
            "animate-in fade-in slide-in-from-bottom-6 duration-700 [animation-delay:200ms] fill-mode-backwards",
            "relative overflow-hidden border-border/50",
            "bg-gradient-to-b from-card via-card to-card/80",
            "shadow-xl shadow-primary/5",
            "backdrop-blur-sm"
          )}
        >
          {/* Decorative top gradient line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          {/* Subtle corner accent */}
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/5 blur-2xl" />

          <CardContent className="relative p-6 sm:p-8 lg:p-10">
            <form onSubmit={handleSubmit} className="space-y-8" noValidate>
              {/* Section 1: Workshop Title */}
              <section className="animate-in fade-in slide-in-from-bottom-3 duration-500 [animation-delay:300ms] fill-mode-backwards">
                <WorkshopTitleField
                  workshopTitle={workshopTitle}
                  onWorkshopTitleChange={handleWorkshopTitleChange}
                />
              </section>

              {/* Decorative divider */}
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <div className="h-1.5 w-1.5 rounded-full bg-primary/30" />
                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-transparent" />
              </div>

              {/* Section 2: Personal Info */}
              <section className="animate-in fade-in slide-in-from-bottom-3 duration-500 [animation-delay:400ms] fill-mode-backwards">
                <PersonalInfoFields
                  name={name}
                  email={email}
                  onNameChange={handleNameChange}
                />
              </section>

              {/* Decorative divider */}
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <div className="h-1.5 w-1.5 rounded-full bg-primary/30" />
                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-transparent" />
              </div>

              {/* Section 3: Research & Capacity */}
              <section className="animate-in fade-in slide-in-from-bottom-3 duration-500 [animation-delay:500ms] fill-mode-backwards">
                <div className="grid gap-6 md:grid-cols-2">
                  <ResearchDomainField
                    researchDomain={researchDomain}
                    onResearchDomainChange={handleResearchDomainChange}
                  />
                  <CapacityField
                    capacity={capacity}
                    onCapacityChange={handleCapacityChange}
                  />
                </div>
              </section>

              {/* Decorative divider */}
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <div className="h-1.5 w-1.5 rounded-full bg-primary/30" />
                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-transparent" />
              </div>

              {/* Section 4: Description */}
              <section className="animate-in fade-in slide-in-from-bottom-3 duration-500 [animation-delay:600ms] fill-mode-backwards">
                <WorkshopDescriptionField
                  description={description}
                  onDescriptionChange={handleDescriptionChange}
                />
              </section>

              {/* Decorative divider */}
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <div className="h-1.5 w-1.5 rounded-full bg-primary/30" />
                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-transparent" />
              </div>

              {/* Section 5: File Upload */}
              <section className="animate-in fade-in slide-in-from-bottom-3 duration-500 [animation-delay:700ms] fill-mode-backwards">
                <FileUploadArea
                  files={files}
                  uploadedCount={uploadedCount}
                  isLoadingQuota={isLoadingQuota}
                  isDragOver={isDragOver}
                  canAddMoreFiles={canAddMoreFiles}
                  maxFiles={maxFiles}
                  onFileChange={handleFileChange}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onRemoveFile={handleRemoveFile}
                />
              </section>

              {/* Footer */}
              <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 [animation-delay:800ms] fill-mode-backwards">
                <FormFooter
                  isSubmitting={isSubmitting}
                  hasFiles={files.length > 0}
                  progress={progress}
                />
              </div>
            </form>
          </CardContent>

          {/* Decorative bottom gradient line */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </Card>

        {/* Footer text */}
        <p className="animate-in fade-in duration-700 [animation-delay:900ms] fill-mode-backwards text-center text-xs text-muted-foreground">
          Need help? Contact our support team for assistance with your submission.
        </p>
      </div>
    </div>
  );
}
