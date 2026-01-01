"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, FileUp, CheckCircle2, Loader2 } from "lucide-react";
import { useJoinForm } from "./hooks";
import {
  LoadingState,
  PersonalInfoFields,
  FileUploadArea,
  FileList,
} from "./components";
import type { JoinFormProps } from "./types";

export function JoinForm({ eventId, eventType }: JoinFormProps) {
  const {
    user,
    isSessionPending,
    personalInfo,
    setName,
    setResearchDomain,
    files,
    quotaInfo,
    canAddMoreFiles,
    isLoadingQuota,
    isDragOver,
    isSubmitting,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    removeFileAt,
    handleSubmit,
  } = useJoinForm(eventId);

  // Loading state
  if (isSessionPending || !user) {
    return <LoadingState />;
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header Section */}
        <div className="space-y-4 text-center">
          <Badge variant="secondary" className="px-4 py-1.5">
            <FileUp className="mr-2 h-3.5 w-3.5" />
            Communicator Registration
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Submit your application
          </h1>
          <p className="text-muted-foreground mx-auto max-w-xl text-balance">
            Share your details and upload your supporting file so we can review
            your application as a communicator.
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="border-border/60 shadow-xl backdrop-blur">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl">
                <User className="text-primary h-5 w-5" />
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
              <PersonalInfoFields
                personalInfo={personalInfo}
                onNameChange={setName}
                onResearchDomainChange={setResearchDomain}
              />

              {/* File Upload Area */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <FileUp className="text-muted-foreground h-4 w-4" />
                  Supporting document
                </Label>
                <p className="text-muted-foreground text-xs">
                  {isLoadingQuota
                    ? "Checking upload limit..."
                    : `${quotaInfo.uploadedCount}/${quotaInfo.maxFiles} already uploaded for this event`}
                </p>

                {files.length === 0 ? (
                  <FileUploadArea
                    isDragOver={isDragOver}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onFileChange={handleFileChange}
                  />
                ) : (
                  <FileList
                    files={files}
                    canAddMore={canAddMoreFiles}
                    onRemoveFile={removeFileAt}
                    onFileChange={handleFileChange}
                  />
                )}
              </div>

              <CardFooter className="flex-col gap-4 px-0 pt-4 sm:flex-row sm:justify-between">
                <p className="text-muted-foreground text-xs">
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
                        Submit application
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
