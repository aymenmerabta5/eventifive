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
              {/* Section 1: Workshop Title */}
              <section className="animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards duration-500 [animation-delay:300ms]">
                <WorkshopTitleField
                  workshopTitle={workshopTitle}
                  onWorkshopTitleChange={handleWorkshopTitleChange}
                />
              </section>

              {/* Decorative divider */}
              <div className="flex items-center gap-4">
                <div className="via-border h-px flex-1 bg-gradient-to-r from-transparent to-transparent" />
                <div className="bg-primary/30 h-1.5 w-1.5 rounded-full" />
                <div className="via-border h-px flex-1 bg-gradient-to-l from-transparent to-transparent" />
              </div>

              {/* Section 2: Personal Info */}
              <section className="animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards duration-500 [animation-delay:400ms]">
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

              {/* Section 3: Research & Capacity */}
              <section className="animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards duration-500 [animation-delay:500ms]">
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
                <div className="via-border h-px flex-1 bg-gradient-to-r from-transparent to-transparent" />
                <div className="bg-primary/30 h-1.5 w-1.5 rounded-full" />
                <div className="via-border h-px flex-1 bg-gradient-to-l from-transparent to-transparent" />
              </div>

              {/* Section 4: Description */}
              <section className="animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards duration-500 [animation-delay:600ms]">
                <WorkshopDescriptionField
                  description={description}
                  onDescriptionChange={handleDescriptionChange}
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
              <div className="animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards duration-500 [animation-delay:800ms]">
                <FormFooter
                  isSubmitting={isSubmitting}
                  hasFiles={files.length > 0}
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
