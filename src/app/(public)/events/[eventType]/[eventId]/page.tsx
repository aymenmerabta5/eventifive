import Link from "next/link";
import { notFound } from "next/navigation";
import { client } from "@/utils/orpc";
import type { Event } from "@/server/db/schema";
import { IconCalendar, IconClock, IconMapPin, IconMail, IconTag, IconUpload } from "@tabler/icons-react";

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
	const event = (await client.events.get({ id: eventId }).catch(() => null)) as
		| Event
		| null;

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
	return (
		<main className="relative min-h-screen bg-slate-50 dark:bg-slate-950">
			<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />

			<div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
				<h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl lg:text-6xl text-center">Event Details</h1>
				<Link
					href="/events"
					className="group mb-8 inline-flex  gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
				>
					<span className="transition-transform group-hover:-translate-x-0.5">←</span>
					Back to Events
				</Link>

				<article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

					<header className="border-b border-slate-200 bg-slate-50 px-8 py-10 dark:border-slate-800 dark:bg-slate-900/50 sm:px-12 sm:py-14">
						<div className="space-y-6">
							<div className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
								{event.type.replace("_", " ")}
							</div>
							<h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl lg:text-6xl">
								{event.title}
							</h1>
						</div>
					</header>
					<section className="border-b border-slate-200 bg-white px-8 py-8 dark:border-slate-800 dark:bg-slate-900 sm:px-12">
						<div className="grid gap-8 sm:grid-cols-2">
							<div className="space-y-3">
								<div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500">
									<IconCalendar className="h-4 w-4" strokeWidth={2} />
									Start Date & Time
								</div>
								<div className="space-y-1">
									<p className="text-xl font-semibold text-slate-900 dark:text-slate-50">
										{formatDate(event.startDate)}
									</p>
									<p className="flex items-center gap-1.5 text-base text-slate-600 dark:text-slate-400">
										<IconClock className="h-4 w-4" strokeWidth={2} />
										{formatTime(event.startDate)}
									</p>
								</div>
							</div>
							<div className="space-y-3">
								<div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500">
									<IconCalendar className="h-4 w-4" strokeWidth={2} />
									End Date & Time
								</div>
								<div className="space-y-1">
									<p className="text-xl font-semibold text-slate-900 dark:text-slate-50">
										{formatDate(event.endDate)}
									</p>
									<p className="flex items-center gap-1.5 text-base text-slate-600 dark:text-slate-400">
										<IconClock className="h-4 w-4" strokeWidth={2} />
										{formatTime(event.endDate)}
									</p>
								</div>
							</div>
						</div>
					</section>
					<section className="bg-white px-8 py-8 dark:bg-slate-900 sm:px-12">
						<h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500">
							Event Details
						</h2>
						<dl className="grid gap-6 sm:grid-cols-2">

							<div className="flex gap-4 border-l-2 border-slate-300 pl-4 dark:border-slate-700">
								<IconTag className="mt-0.5 h-5 w-5 shrink-0 text-slate-400 dark:text-slate-600" strokeWidth={2} />
								<div className="space-y-1">
									<dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500">
										Type
									</dt>
									<dd className="text-base font-medium capitalize text-slate-900 dark:text-slate-50">
										{event.type.replace("_", " ")}
									</dd>
								</div>
							</div>
							<div className="flex gap-4 border-l-2 border-slate-300 pl-4 dark:border-slate-700">
								<IconMapPin className="mt-0.5 h-5 w-5 shrink-0 text-slate-400 dark:text-slate-600" strokeWidth={2} />
								<div className="space-y-1">
									<dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500">
										Location
									</dt>
									<dd className="text-base font-medium text-slate-900 dark:text-slate-50">
										{event.location ?? "To be announced"}
									</dd>
								</div>
							</div>
							<div className="flex gap-4 border-l-2 border-slate-300 pl-4 dark:border-slate-700">
								<IconTag className="mt-0.5 h-5 w-5 shrink-0 text-slate-400 dark:text-slate-600" strokeWidth={2} />
								<div className="space-y-1">
									<dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500">
										Description
									</dt>
									<dd className="text-base font-medium capitalize text-slate-900 dark:text-slate-50">
										{event.description && (
											<p className="max-w-3xl text-lg leading-relaxed text-slate-600 dark:text-slate-400 text-white">
												{event.description}
											</p>
										)}
									</dd>
								</div>
							</div>
							{event.contactEmail && (
								<div className="flex gap-4 border-l-2 border-slate-300 pl-4 dark:border-slate-700">
									<IconMail className="mt-0.5 h-5 w-5 shrink-0 text-slate-400 dark:text-slate-600" strokeWidth={2} />
									<div className="space-y-1">
										<dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500">
											Contact
										</dt>
										<dd>
											<a
												href={`mailto:${event.contactEmail}`}
												className="text-base font-medium text-slate-900 underline decoration-slate-300 underline-offset-2 transition-colors hover:text-slate-700 hover:decoration-slate-400 dark:text-slate-50 dark:decoration-slate-700 dark:hover:text-slate-200 dark:hover:decoration-slate-600"
											>
												{event.contactEmail}
											</a>
										</dd>
									</div>
								</div>
							)}
							{event.theme && (
								<div className={`flex gap-4 border-l-2 border-slate-300 pl-4 dark:border-slate-700 ${!event.contactEmail ? 'sm:col-span-2' : ''}`}>
									<IconTag className="mt-0.5 h-5 w-5 shrink-0 text-slate-400 dark:text-slate-600" strokeWidth={2} />
									<div className="space-y-1">
										<dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500">
											Theme
										</dt>
										<dd className="text-base font-medium text-slate-900 dark:text-slate-50">
											{event.theme}
										</dd>
									</div>
								</div>
							)}
						</dl>
					</section>
				</article>
				<div className="mt-10 flex justify-center">
					<button className="group inline-flex items-center gap-3 rounded-lg border-2 border-slate-300 bg-white px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800">
						<IconUpload className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" strokeWidth={2} />
						<span>Upload Files</span>
					</button>
				</div>
			</div>
		</main>
	);
}