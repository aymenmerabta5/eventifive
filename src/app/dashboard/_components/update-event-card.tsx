"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "@tanstack/react-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button as StatefulButton } from "@/components/ui/stateful-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { client, orpc } from "@/utils/orpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, MapPin, Type, FileText, Loader2 } from "lucide-react";
import { updateEventSchema } from "@/lib/schemas/schemas";
import { eventTypeValues, type EventType } from "@/server/db/schema";

type MyEventsResponse = Awaited<ReturnType<typeof client.myEventsRouter>>;

const eventTypeLabels: Record<EventType, string> = {
	congress: "Congress",
	seminar: "Seminar",
	workshop: "Workshop",
	scientific_meeting: "Scientific Meeting",
	conference: "Conference",
	symposium: "Symposium",
};

const eventTypeOptions = eventTypeValues.map((value) => ({
	value,
	label: eventTypeLabels[value],
}));

type UpdateEventInitialValues = {
	title?: string;
	description?: string;
	type?: EventType;
	startDate?: string;
	endDate?: string;
	location?: string;
};

const toDateTimeLocalInput = (value?: Date | string | null) => {
	if (!value) return "";
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return "";
	const offset = parsed.getTimezoneOffset();
	const local = new Date(parsed.getTime() - offset * 60_000);
	return local.toISOString().slice(0, 16);
};

export function UpdateEventCard({ eventId, initialValues }: { eventId?: string; initialValues?: UpdateEventInitialValues }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	// TEACHING: Access the query client to invalidate cached data after mutations
	const queryClient = useQueryClient();
	const routeEventId = searchParams?.get("eventId") ?? "";
	const resolvedEventId = eventId || routeEventId || "";
	const needsFetch = !initialValues && Boolean(resolvedEventId);


	const {
		data: myEventsData,
		isPending: isPrefillPending,
		error: prefillError,
	} = useQuery({
		queryKey: ["my-events"],
		queryFn: () => client.myEventsRouter(),
		enabled: needsFetch,
		staleTime: 1000 * 60,
	});

	const event = useMemo(() => {
		if (initialValues) return null; 
		if (!myEventsData?.events || !resolvedEventId) return null;
		return myEventsData.events.find((e) => e.id === resolvedEventId) ?? null;
	}, [myEventsData, resolvedEventId, initialValues]);

	useEffect(() => {
		if (!needsFetch || isPrefillPending) return;
		if (prefillError) {
			toast.error("Failed to load events. Please try again.");
			return;
		}
		if (!event && resolvedEventId) {
			toast.error("Selected event not found. Please return to My Events.");
		}
	}, [needsFetch, isPrefillPending, event, resolvedEventId, prefillError]);

	const defaultFormValues = useMemo(() => {
		if (initialValues) {
			return {
				eventId: resolvedEventId,
				title: initialValues.title ?? "",
				description: initialValues.description ?? "",
				type: (initialValues.type ?? "") as "" | EventType,
				startDate: initialValues.startDate ?? "",
				endDate: initialValues.endDate ?? "",
				location: initialValues.location ?? "",
			};
		}

		if (event) {
			return {
				eventId: resolvedEventId,
				title: event.title ?? "",
				description: event.description ?? "",
				type: event.type as "" | EventType,
				startDate: toDateTimeLocalInput(event.startDate),
				endDate: toDateTimeLocalInput(event.endDate),
				location: event.location ?? "",
			};
		}

		return {
			eventId: resolvedEventId,
			title: "",
			description: "",
			type: "" as "" | EventType,
			startDate: "",
			endDate: "",
			location: "",
		};
	}, [resolvedEventId, initialValues, event]);

	const { mutate: updateEvent } = useMutation(orpc.updateEventRouter.mutationOptions({
		onSuccess: (data) => {
			toast.success(data.message || "Event updated successfully");
			// TEACHING: After updating an event, we MUST invalidate the cache
			// This ensures the events list shows the updated data immediately
			// The "void" keyword tells TypeScript we're intentionally not awaiting this Promise
			void queryClient.invalidateQueries({ queryKey: ["my-events"] });
			router.push("/dashboard");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update event");
		},
	}));

	const form = useForm({
		defaultValues: defaultFormValues,
		onSubmit: async ({ value }) => {
			try {
				updateEvent({
					eventId: value.eventId,
					title: value.title,
					description: value.description || undefined,
					type: value.type as EventType,
					startDate: value.startDate,
					endDate: value.endDate,
					location: value.location || undefined,
				});
			} catch (error) {
				console.error("Failed to update event:", error);
				toast.error("Failed to update event");
			}
		},
		validators: {
			onSubmit: ({ value }) => {
				const result = updateEventSchema.safeParse(value);
				if (!result.success) {
					return result.error.formErrors.fieldErrors;
				}
			},
		},
	});

	useEffect(() => {
		form.reset(defaultFormValues);
	}, [defaultFormValues, form]);

	const isLoadingEvent = needsFetch && isPrefillPending;
	const eventLoadFailed = needsFetch && !isPrefillPending && !event;
	const missingEventSelection = !resolvedEventId;

	return (
		<Card className="shadow-lg">
			<CardHeader>
				<CardTitle className="text-2xl md:text-3xl font-bold">Update Event</CardTitle>
				<CardDescription>
					Update the details below to modify the scientific event
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
					{isLoadingEvent && (
						<div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
							<Loader2 className="size-4 animate-spin" />
							Loading event details...
						</div>
					)}

					{eventLoadFailed && (
						<div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
							Unable to load this event. Please return to your events and try again.
						</div>
					)}

					{missingEventSelection && (
						<div className="rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
							Select an event from My Events to update it here.
						</div>
					)}

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
								disabled={
									!resolvedEventId ||
									eventLoadFailed ||
									isLoadingEvent ||
									!state.canSubmit ||
									state.isSubmitting
								}
							>
								{state.isSubmitting ? "Updating..." : "Update Event"}
							</StatefulButton>
						)}
					</form.Subscribe>
				</form>
			</CardContent>
		</Card>
	);
}
