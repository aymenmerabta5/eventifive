import Link from "next/link";
import { notFound } from "next/navigation";
import { client } from "@/utils/orpc";
import type { Event } from "@/server/db/schema";
import { IconCalendar, IconClock, IconMapPin, IconMail, IconTag } from "@tabler/icons-react";
import ParticipationOptions from "./Testimonials";
import { EventRegistrationSection } from "./EventRegistrationSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function mapEventType(urlType: string) {
	const mapping: Partial<Record<string, Event["type"]>> = {
		congress: "congress",
		seminar: "seminar",
		workshop: "workshop",
		"scientific-meeting": "scientific_meeting",
		conference: "conference",
		symposium: "symposium",
	};
	return mapping[urlType];
}

export default async function EventDetailPage({
	params,
}: {
	params: Promise<{ eventType: string; eventId: string }>;
}) {
	const { eventType, eventId } = await params;
	const mappedType = mapEventType(eventType);
	if (!mappedType) notFound();

	// Fetch event using oRPC
	const event = (await client.events.get({ id: eventId }).catch(() => null)) as Event | null;

	if (!event || event.type !== mappedType) {
		notFound();
	}

	const formatDate = (date: Date | string) => {
		return new Date(date).toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const formatTime = (date: Date | string) => {
		return new Date(date).toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const now = new Date();
	const eventStart = new Date(event.startDate);
	const delayDate = new Date();
	delayDate.setDate(now.getDate() + 7);
	const isEventMoreThan7DaysAway = eventStart > delayDate;

	return (
		<main className="relative min-h-screen">
			<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.25)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.25)_1px,transparent_1px)] bg-size-[24px_24px]" />

			<div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
				<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="space-y-2">
						<h1 className="text-center text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-left sm:text-5xl">
							Event Details
						</h1>
						<p className="text-center text-sm text-muted-foreground sm:text-left">
							Discover dates, location, and key information about this event.
						</p>
					</div>
					<Button variant="outline" asChild className="group gap-2">
						<Link href="/events" aria-label="Back to events list">
							<span aria-hidden className="transition-transform group-hover:-translate-x-0.5">
								←
							</span>
							Back to Events
						</Link>
					</Button>
				</div>

				<Card className="overflow-hidden">
					<CardHeader className="border-b bg-card/50">
						<div className="space-y-4">
							<Badge variant="secondary" className="w-fit capitalize">
								{event.type.replaceAll("_", " ")}
							</Badge>
							<CardTitle className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
								{event.title}
							</CardTitle>
							<div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
								<div className="inline-flex items-center gap-2">
									<IconMapPin className="size-4 text-primary" strokeWidth={2} />
									<span>{event.location ?? "To be announced"}</span>
								</div>
								<div className="hidden h-4 w-px bg-border sm:block" aria-hidden />
								<div className="inline-flex items-center gap-2">
									<IconCalendar className="size-4 text-primary" strokeWidth={2} />
									<span>
										{formatDate(event.startDate)} · {formatTime(event.startDate)} —{" "}
										{formatDate(event.endDate)} · {formatTime(event.endDate)}
									</span>
								</div>
							</div>
						</div>
					</CardHeader>

					<CardContent className="pt-6">
						<section aria-labelledby="schedule-heading" className="space-y-4">
							<h2
								id="schedule-heading"
								className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
							>
								Schedule
							</h2>
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="rounded-lg border bg-card p-4">
									<div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
										<IconCalendar className="size-4 text-primary" strokeWidth={2} />
										Start
									</div>
									<div className="space-y-1">
										<p className="text-base font-semibold text-foreground">
											{formatDate(event.startDate)}
										</p>
										<p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
											<IconClock className="size-4 text-primary" strokeWidth={2} />
											{formatTime(event.startDate)}
										</p>
									</div>
								</div>

								<div className="rounded-lg border bg-card p-4">
									<div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
										<IconCalendar className="size-4 text-primary" strokeWidth={2} />
										End
									</div>
									<div className="space-y-1">
										<p className="text-base font-semibold text-foreground">
											{formatDate(event.endDate)}
										</p>
										<p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
											<IconClock className="size-4 text-primary" strokeWidth={2} />
											{formatTime(event.endDate)}
										</p>
									</div>
								</div>
							</div>
						</section>

						<div className="my-6 h-px w-full bg-border" aria-hidden />

						<section aria-labelledby="details-heading" className="space-y-4">
							<h2
								id="details-heading"
								className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
							>
								Details
							</h2>
							<dl className="grid gap-4 sm:grid-cols-2">
								<div className="rounded-lg border bg-card p-4">
									<dt className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
										<IconTag className="size-4 text-primary" strokeWidth={2} />
										Type
									</dt>
									<dd className="text-sm text-muted-foreground capitalize">
										{event.type.replaceAll("_", " ")}
									</dd>
								</div>

								<div className="rounded-lg border bg-card p-4">
									<dt className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
										<IconMapPin className="size-4 text-primary" strokeWidth={2} />
										Location
									</dt>
									<dd className="text-sm text-muted-foreground">
										{event.location ?? "To be announced"}
									</dd>
								</div>

								<div className="rounded-lg border bg-card p-4 sm:col-span-2">
									<dt className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
										<IconTag className="size-4 text-primary" strokeWidth={2} />
										Description
									</dt>
									<dd className="text-sm leading-relaxed text-muted-foreground">
										{event.description ?? "No description provided."}
									</dd>
								</div>

								{event.contactEmail && (
									<div className="rounded-lg border bg-card p-4">
										<dt className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
											<IconMail className="size-4 text-primary" strokeWidth={2} />
											Contact
										</dt>
										<dd>
											<Button variant="link" asChild className="h-auto p-0 text-sm">
												<a href={`mailto:${event.contactEmail}`}>{event.contactEmail}</a>
											</Button>
										</dd>
									</div>
								)}

								{event.theme && (
									<div
										className={cn(
											"rounded-lg border bg-card p-4",
											!event.contactEmail && "sm:col-span-2",
										)}
									>
										<dt className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
											<IconTag className="size-4 text-primary" strokeWidth={2} />
											Theme
										</dt>
										<dd className="text-sm text-muted-foreground">{event.theme}</dd>
									</div>
								)}
							</dl>
						</section>
					</CardContent>
				</Card>

				<EventRegistrationSection
					eventId={event.id}
					priceAmount={event.priceAmount}
					priceCurrency={event.priceCurrency}
					eventTitle={event.title}
				/>

				{isEventMoreThan7DaysAway && <ParticipationOptions />}
			</div>
		</main>
	);
}
