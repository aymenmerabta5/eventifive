"use client";
import { orpc } from "@/utils/orpc";
import { useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { client } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertTriangle, CalendarDays, History, LayoutGrid, Loader2, MapPin, MoreHorizontal, Pencil, RefreshCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
// TEACHING: Import types directly from the schema instead of inferring from API response
// This gives us reliable, explicit types rather than depending on complex generic inference
// The Event type is the source of truth - it's what Drizzle generates from your schema
import type { Event, EventType } from "@/server/db/schema";

// TEACHING: Using the schema's Event type directly is more reliable than
// Awaited<ReturnType<...>> which can sometimes resolve to 'unknown' with complex generics
type AdminEvent = Event;


const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
	dateStyle: "medium",
	timeStyle: "short",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
	dateStyle: "medium",
});

// TEACHING: Use EventType from schema for the Record key type
// This ensures the record has exactly the keys that exist in your enum
const eventTypeLabels: Record<EventType, string> = {
	congress: "Congress",
	seminar: "Seminar",
	workshop: "Workshop",
	scientific_meeting: "Scientific Meeting",
	conference: "Conference",
	symposium: "Symposium",
};


const formatDateTime = (value: Date | string) => dateTimeFormatter.format(new Date(value));
const formatDate = (value: Date | string) => dateFormatter.format(new Date(value));

const formatSchedule = (start: Date | string, end: Date | string) => {
	const startDate = new Date(start);
	const endDate = new Date(end);

	const sameDay = startDate.toDateString() === endDate.toDateString();

	if (sameDay) {
		return `${formatDate(start)} • ${startDate.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		})} – ${endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
	}

	return `${formatDateTime(start)} → ${formatDateTime(end)}`;
};

const getEventStatus = (event: AdminEvent) => {
	const now = Date.now();
	const endTime = new Date(event.endDate).getTime();
	return endTime >= now ? ("Upcoming" as const) : ("Completed" as const);
};

export function MyEvents() {
	const router = useRouter();
	const queryClient = useQueryClient();

	// TEACHING: Define the expected response type for better type safety
	// When oRPC's type inference doesn't flow through properly, we can
	// explicitly type the useQuery hook with generics <TData, TError>
	type MyEventsResponse = { events: AdminEvent[]; total: number };
	
	const {
		data,
		isPending,
		error,
		refetch,
		isRefetching,
	} = useQuery<MyEventsResponse>({
		queryKey: ["my-events"],
		queryFn: () => client.events.myEvents() as Promise<MyEventsResponse>,
		staleTime: 1000 * 60,
	});

	const { mutate: deleteEvent } = useMutation(
		orpc.events.delete.mutationOptions({
			onSuccess: () => {
				toast.success("Event deleted successfully");
				void queryClient.invalidateQueries({ queryKey: ["my-events"] });
			},
			onError: (error) => {
				toast.error(error.message || "Failed to delete event");
			},
		}),
	);

	const events = useMemo(() => data?.events ?? [], [data?.events]);
	const totalEvents = data?.total ?? 0;

	const { upcomingCount, pastCount } = useMemo(() => {
		const upcoming = events.filter((event) => getEventStatus(event) === "Upcoming").length;
		return {
			upcomingCount: upcoming,
			pastCount: events.length - upcoming,
		};
	}, [events]);

	const handleRefresh = useCallback(() => {
		void refetch();
	}, [refetch]);

	const handleUpdate = useCallback((event: AdminEvent) => {
		const params = new URLSearchParams({
			view: "update-event",
			eventId: event.id,
		});
		router.push(`/dashboard?${params.toString()}`);
	}, [router]);

	const handleDelete = useCallback((event: AdminEvent) => {
		deleteEvent({ eventId: event.id });
	}, [deleteEvent]);

	if (isPending) {
		return (
			<Card className="border-dashed">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Loader2 className="size-4 animate-spin text-primary" />
						Loading your events
					</CardTitle>
					<CardDescription>Fetching the events you have created.</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	if (error) {
		const message = error instanceof Error ? error.message : "Unable to load events.";
		return (
			<Card className="border-destructive/30 bg-destructive/5">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-destructive">
						<AlertTriangle className="size-5" />
						Failed to load events
					</CardTitle>
					<CardDescription className="text-destructive/70">{message}</CardDescription>
				</CardHeader>
				<CardContent>
					<Button variant="destructive" onClick={handleRefresh} disabled={isRefetching}>
						{isRefetching && <Loader2 className="mr-2 size-4 animate-spin" />}
						Try again
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl font-semibold tracking-tight">My Events</h1>
						<p className="text-muted-foreground">
							Review every event created by you.
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<Button variant="outline" onClick={handleRefresh} disabled={isRefetching}>
							{isRefetching ? (
								<Loader2 className="mr-2 size-4 animate-spin" />
							) : (
								<RefreshCcw className="mr-2 size-4" />
							)}
							Refresh
						</Button>
					</div>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total events</CardTitle>
						<LayoutGrid className="size-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalEvents}</div>
						<p className="text-muted-foreground text-xs">All events you have created</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Upcoming</CardTitle>
						<CalendarDays className="size-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{upcomingCount}</div>
						<p className="text-muted-foreground text-xs">Events that are still active</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Completed</CardTitle>
						<History className="size-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{pastCount}</div>
						<p className="text-muted-foreground text-xs">Finished events</p>
					</CardContent>
				</Card>
			</div>

			{events.length === 0 ? (
				<Card className="border-dashed">
					<CardHeader className="flex flex-col items-center justify-center">
						<CardTitle className="flex items-center gap-2 text-lg">
							<MapPin className="size-4 text-muted-foreground" />
							No events yet
						</CardTitle>
						<CardDescription>
							Start by creating your first event. It will appear here once saved.
						</CardDescription>
					</CardHeader>
				</Card>
			) : (
				<Card>
					<CardHeader className="space-y-1">
						<CardTitle className="text-lg font-semibold">Administrator events</CardTitle>
						<CardDescription>
							these are all events that you have created.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Event</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Schedule</TableHead>
									<TableHead>Location</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="w-[50px]"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{events.map((event) => {
									const status = getEventStatus(event);
									return (
										<TableRow key={event.id}>
											<TableCell>
												<div className="font-medium">{event.title}</div>
											</TableCell>
											<TableCell>
												<Badge variant="secondary">{eventTypeLabels[event.type]}</Badge>
											</TableCell>
											<TableCell>
												<div className="text-sm font-medium">
													{formatSchedule(event.startDate, event.endDate)}
												</div>
												<p className="text-muted-foreground text-xs">
													Created {formatDate(event.createdAt)}
												</p>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-1 text-sm">
													<MapPin className="size-3.5 text-muted-foreground" />
													{event.location || "TBA"}
												</div>
											</TableCell>
											<TableCell>
												<Badge variant={status === "Upcoming" ? "default" : "outline"}>{status}</Badge>
											</TableCell>
											<TableCell>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" className="h-8 w-8">
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuLabel>Actions</DropdownMenuLabel>
														<DropdownMenuSeparator />
														<DropdownMenuItem onClick={() => handleUpdate(event)}>
															<Pencil className="mr-2 h-4 w-4" />
															Update
														</DropdownMenuItem>
														<DropdownMenuItem 
															onClick={() => handleDelete(event)}
															className="text-destructive focus:text-destructive"
														>
															<Trash2 className="mr-2 h-4 w-4" />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
							<TableCaption>You have created {events.length} event(s).</TableCaption>
						</Table>
					</CardContent>
				</Card>
			)}
		</div>
	);
}