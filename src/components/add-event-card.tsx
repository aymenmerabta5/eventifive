"use client";

import { useForm } from "@tanstack/react-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button as StatefulButton } from "@/components/ui/stateful-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { orpc } from "@/utils/orpc";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Type, FileText } from "lucide-react";
import { createEventSchema } from "@/lib/schemas/schemas";

const eventTypeOptions = [
	{ value: "congress", label: "Congress" },
	{ value: "seminar", label: "Seminar" },
	{ value: "workshop", label: "Workshop" },
	{ value: "scientific_meeting", label: "Scientific Meeting" },
	{ value: "conference", label: "Conference" },
	{ value: "symposium", label: "Symposium" },
] as const;

export function AddEventCard() {
	const router = useRouter();
	
	const { mutate: createEvent } = useMutation(orpc.eventRouter.mutationOptions({
		onSuccess: (data) => {
			toast.success(data.message || "Event created successfully");
			router.push("/events");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create event");
		},
	}));

	const form = useForm({
		defaultValues: {
			title: "",
			description: "",
			type: "" as "" | "congress" | "seminar" | "workshop" | "scientific_meeting" | "conference" | "symposium",
			startDate: "",
			endDate: "",
			location: "",
		},
		onSubmit: async ({ value }) => {
			try {
				createEvent({
					title: value.title,
					description: value.description || undefined,
					type: value.type as "congress" | "seminar" | "workshop" | "scientific_meeting" | "conference" | "symposium",
					startDate: value.startDate,
					endDate: value.endDate,
					location: value.location || undefined,
				});
			} catch (error) {
				console.error("Failed to create event:", error);
				toast.error("Failed to create event");
			}
		},
		validators: {
			onSubmit: ({ value }) => {
				const result = createEventSchema.safeParse(value);
				if (!result.success) {
					return result.error.formErrors.fieldErrors;
				}
			},
		},
	});

	return (
		<Card className="shadow-lg">
			<CardHeader>
				<CardTitle className="text-2xl md:text-3xl font-bold">Create New Event</CardTitle>
				<CardDescription>
					Fill in the details below to create a new scientific event
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-6"
				>
					{/* Title Field */}
					<form.Field name="title">
						{(field) => (
							<div className="space-y-2">
								<Label
									htmlFor={field.name}
									className="flex items-center gap-2 text-sm font-medium"
								>
									<FileText className="size-4" />
									Event Title *
								</Label>
								<Input
									id={field.name}
									name={field.name}
									type="text"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Enter event title"
									className="w-full"
								/>
								{field.state.meta.errors.map((error) => (
									<p
										key={error}
										className="text-destructive text-sm"
									>
										{error}
									</p>
								))}
							</div>
						)}
					</form.Field>

					{/* Type Field */}
					<form.Field name="type">
						{(field) => (
							<div className="space-y-2">
								<Label
									htmlFor={field.name}
									className="flex items-center gap-2 text-sm font-medium"
								>
									<Type className="size-4" />
									Event Type *
								</Label>
								<Select
									value={field.state.value}
									onValueChange={(value) => field.handleChange(value as typeof field.state.value)}
									onOpenChange={(open) => !open && field.handleBlur()}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select event type" />
									</SelectTrigger>
									<SelectContent>
										{eventTypeOptions.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{field.state.meta.errors.map((error) => (
									<p
										key={error}
										className="text-destructive text-sm"
									>
										{error}
									</p>
								))}
							</div>
						)}
					</form.Field>

					{/* Description Field */}
					<form.Field name="description">
						{(field) => (
							<div className="space-y-2">
								<Label
									htmlFor={field.name}
									className="flex items-center gap-2 text-sm font-medium"
								>
									<FileText className="size-4" />
									Description
								</Label>
								<Textarea
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Enter event description"
									className="w-full min-h-[120px]"
								/>
								{field.state.meta.errors.map((error) => (
									<p
										key={error}
										className="text-destructive text-sm"
									>
										{error}
									</p>
								))}
							</div>
						)}
					</form.Field>

					{/* Start Date Field */}
					<form.Field name="startDate">
						{(field) => (
							<div className="space-y-2">
								<Label
									htmlFor={field.name}
									className="flex items-center gap-2 text-sm font-medium"
								>
									<Calendar className="size-4" />
									Start Date *
								</Label>
								<Input
									id={field.name}
									name={field.name}
									type="datetime-local"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									className="w-full"
								/>
								{field.state.meta.errors.map((error) => (
									<p
										key={error}
										className="text-destructive text-sm"
									>
										{error}
									</p>
								))}
							</div>
						)}
					</form.Field>

					{/* End Date Field */}
					<form.Field name="endDate">
						{(field) => (
							<div className="space-y-2">
								<Label
									htmlFor={field.name}
									className="flex items-center gap-2 text-sm font-medium"
								>
									<Calendar className="size-4" />
									End Date *
								</Label>
								<Input
									id={field.name}
									name={field.name}
									type="datetime-local"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									className="w-full"
								/>
								{field.state.meta.errors.map((error) => (
									<p
										key={error}
										className="text-destructive text-sm"
									>
										{error}
									</p>
								))}
							</div>
						)}
					</form.Field>

					{/* Location Field */}
					<form.Field name="location">
						{(field) => (
							<div className="space-y-2">
								<Label
									htmlFor={field.name}
									className="flex items-center gap-2 text-sm font-medium"
								>
									<MapPin className="size-4" />
									Location
								</Label>
								<Input
									id={field.name}
									name={field.name}
									type="text"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Enter event location"
									className="w-full"
								/>
								{field.state.meta.errors.map((error) => (
									<p
										key={error}
										className="text-destructive text-sm"
									>
										{error}
									</p>
								))}
							</div>
						)}
					</form.Field>

					{/* Submit Button */}
					<form.Subscribe>
						{(state) => (
							<StatefulButton
								type="submit"
								className="w-full h-11 rounded-4xl cursor-pointer"
								disabled={!state.canSubmit || state.isSubmitting}
							>
								{state.isSubmitting ? "Creating..." : "Create Event"}
							</StatefulButton>
						)}
					</form.Subscribe>
				</form>
			</CardContent>
		</Card>
	);
}

