import Link from "next/link";
import { notFound } from "next/navigation";
import { client } from "@/utils/orpc";
import type { Event } from "@/server/db/schema";
import { IconCalendar, IconClock, IconMapPin, IconMail, IconTag } from "@tabler/icons-react";
import ParticipationOptions from "./Testimonials";

function mapEventType(urlType: string) {
	const mapping: Record<string, Event["type"]> = {
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

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const formatTime = (date: Date) => {
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
		<main className="relative min-h-screen bg-slate-50 dark:bg-slate-950">
			<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />

			<div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
				<h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl lg:text-6xl text-center">
					Event Details
				</h1>
				<Link
					href="/events"
					className="group mb-8 inline-flex  gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
				>
					<span className="transition-transform group-hover:-translate-x-0.5">←</span>
					Back to Events
				</Link>

				<article className="overflow-hidden rounded-lg border-2 border-border bg-card shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-primary/10 dark:hover:shadow-primary/20">
					<header className="border-b border-border bg-card/50 px-8 py-10 sm:px-12 sm:py-14">
						<div className="space-y-6">
							<div className="inline-flex items-center gap-2 rounded-lg border-2 border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-widest text-foreground">
								{event.type.replace("_", " ")}
							</div>
							<h1 className="text-foreground text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
								{event.title}
							</h1>
						</div>
					</header>
					<section className="border-b border-border bg-card px-8 py-8 sm:px-12">
						<div className="grid gap-8 sm:grid-cols-2">
							<div className="space-y-3">
								<div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
									<IconCalendar className="h-4 w-4 text-primary" strokeWidth={2} />
									Start Date & Time
								</div>
								<div className="space-y-1">
									<p className="text-xl font-semibold text-foreground">
										{formatDate(event.startDate)}
									</p>
									<p className="flex items-center gap-1.5 text-base text-muted-foreground">
										<IconClock className="h-4 w-4 text-primary" strokeWidth={2} />
										{formatTime(event.startDate)}
									</p>
								</div>
							</div>
							<div className="space-y-3">
								<div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
									<IconCalendar className="h-4 w-4 text-primary" strokeWidth={2} />
									End Date & Time
								</div>
								<div className="space-y-1">
									<p className="text-xl font-semibold text-foreground">
										{formatDate(event.endDate)}
									</p>
									<p className="flex items-center gap-1.5 text-base text-muted-foreground">
										<IconClock className="h-4 w-4 text-primary" strokeWidth={2} />
										{formatTime(event.endDate)}
									</p>
								</div>
							</div>
						</div>
					</section>
					<section className="bg-card px-8 py-8 sm:px-12">
						<h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
							Event Details
						</h2>
						<dl className="grid gap-6 sm:grid-cols-2">
							<div className="flex gap-4 border-l-2 border-primary/30 pl-4">
								<IconTag className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={2} />
								<div className="space-y-1">
									<dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
										Type
									</dt>
									<dd className="text-base font-medium capitalize text-foreground">
										{event.type.replace("_", " ")}
									</dd>
								</div>
							</div>
							<div className="flex gap-4 border-l-2 border-primary/30 pl-4">
								<IconMapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={2} />
								<div className="space-y-1">
									<dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
										Location
									</dt>
									<dd className="text-base font-medium text-foreground">
										{event.location ?? "To be announced"}
									</dd>
								</div>
							</div>
							<div className="flex gap-4 border-l-2 border-primary/30 pl-4 sm:col-span-2">
								<IconTag className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={2} />
								<div className="space-y-1">
									<dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
										Description
									</dt>
									<dd className="text-base font-medium text-foreground">
										{event.description && (
											<p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
												{event.description}
											</p>
										)}
									</dd>
								</div>
							</div>
							{event.contactEmail && (
								<div className="flex gap-4 border-l-2 border-primary/30 pl-4">
									<IconMail className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={2} />
									<div className="space-y-1">
										<dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
											Contact
										</dt>
										<dd>
											<a
												href={`mailto:${event.contactEmail}`}
												className="text-base font-medium text-foreground underline decoration-border underline-offset-2 transition-colors hover:text-primary hover:decoration-primary"
											>
												{event.contactEmail}
											</a>
										</dd>
									</div>
								</div>
							)}
							{event.theme && (
								<div
									className={`flex gap-4 border-l-2 border-primary/30 pl-4 ${
										!event.contactEmail ? "sm:col-span-2" : ""
									}`}
								>
									<IconTag className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={2} />
									<div className="space-y-1">
										<dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
											Theme
										</dt>
										<dd className="text-base font-medium text-foreground">{event.theme}</dd>
									</div>
								</div>
							)}
						</dl>
					</section>
				</article>
				{isEventMoreThan7DaysAway && <ParticipationOptions />}
			</div>
		</main>
	);
}
