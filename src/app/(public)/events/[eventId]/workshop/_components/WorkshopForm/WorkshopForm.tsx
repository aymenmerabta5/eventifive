"use client";

import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User } from "lucide-react";

import { useWorkshopForm } from "./hooks";
import {
	LoadingState,
	FormHeader,
	PersonalInfoFields,
	ResearchDomainField,
	AboutIdeaField,
	FileUploadArea,
	FormFooter,
} from "./components";
import type { WorkshopFormProps } from "./types";

export function WorkshopForm({ eventId, eventType }: WorkshopFormProps) {
	const {
		user,
		isPending,
		name,
		email,
		researchDomain,
		aboutIdea,
		files,
		uploadedCount,
		isLoadingQuota,
		isSubmitting,
		isDragOver,
		canAddMoreFiles,
		maxFiles,
		handleNameChange,
		handleResearchDomainChange,
		handleAboutIdeaChange,
		handleFileChange,
		handleDrop,
		handleDragOver,
		handleDragLeave,
		handleRemoveFile,
		handleSubmit,
	} = useWorkshopForm({ eventId });

	// Loading state - ALWAYS handle first
	if (isPending || !user) {
		return <LoadingState />;
	}

	// Main content
	return (
		<div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
			<div className="w-full max-w-3xl space-y-8">
				<FormHeader />

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
							<PersonalInfoFields
								name={name}
								email={email}
								onNameChange={handleNameChange}
							/>

							<Separator />

							<ResearchDomainField
								researchDomain={researchDomain}
								onResearchDomainChange={handleResearchDomainChange}
							/>

							<Separator />

							<AboutIdeaField
								aboutIdea={aboutIdea}
								onAboutIdeaChange={handleAboutIdeaChange}
							/>

							<Separator />

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

							<FormFooter
								isSubmitting={isSubmitting}
								hasFiles={files.length > 0}
							/>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
