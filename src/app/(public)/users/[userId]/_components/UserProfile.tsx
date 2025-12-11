"use client";

import { IconBuilding, IconFlask, IconBook, IconMail, IconCalendar, IconCheck } from "@tabler/icons-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import type { JSONContent } from "@tiptap/react";
import { useEffect } from "react";

interface UserProfileProps {
	user: {
		id: string;
		name: string;
		email: string;
		emailVerified: boolean;
		image: string | null;
		imageUrl: string | null;
		institution: string | null;
		researchDomain: string | null;
		biography: any;
		createdAt: Date;
		updatedAt: Date;
		recentEvents?: {
			id: string;
			title: string;
			date: string | Date;
			location?: string;
			role?:
				| "speaker"
				| "reviewer"
				| "committee"
				| "attendee"
				| "organizer"
				| "admin"
				| "mentor"
				| "judge"
				| string;
			status?: "upcoming" | "past" | "attending";
		}[];
	};
}

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

// Read-only biography viewer component
function BiographyViewer({ content }: { content: JSONContent | string | null | undefined }) {
	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				paragraph: {
					HTMLAttributes: {
						class: 'leading-relaxed',
					},
				},
				heading: {
					levels: [1, 2, 3, 4],
					HTMLAttributes: {
						class: "font-sans"
					}
				},
				bulletList: {
					keepMarks: true,
					keepAttributes: false,
				},
				orderedList: {
					keepMarks: true,
					keepAttributes: false,
				},
			}),
			TextAlign.configure({
				types: ['heading', 'paragraph'],
			}),
		],
		content: content || undefined,
		editable: false,
		editorProps: {
			attributes: {
				class:
					'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-4 dark:prose-invert',
			},
		},
		immediatelyRender: false,
	});

	useEffect(() => {
		if (editor && content) {
			const currentContent = editor.getJSON();
			const contentToSet = typeof content === "string" 
				? { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: content }] }] }
				: content;
			
			if (JSON.stringify(currentContent) !== JSON.stringify(contentToSet)) {
				editor.commands.setContent(contentToSet);
			}
		}
	}, [content, editor]);

	if (!editor) {
		return null;
	}

	return (
		
			<EditorContent editor={editor} />
		
	);
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
	year: "numeric",
	month: "long",
	day: "numeric",
});

export default function UserProfile({ user }: UserProfileProps) {
	const initials = getInitials(user.name);
	const profileImageUrl = user.imageUrl || user.image;
	const recentEvents = (user.recentEvents ?? []).slice(0, 4);

	return (
		<div className="min-h-screen bg-linear-to-b from-background via-background to-primary/5">
			<div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-8">
				{/* Hero */}
				<div className="relative overflow-hidden rounded-3xl border border-border/60 bg-linear-to-br from-primary/10 via-background to-background shadow-xl">
					<div className="absolute inset-0 pointer-events-none">
						<div className="absolute -left-20 -top-32 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
						<div className="absolute right-0 top-10 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />
						<div className="absolute bottom-0 left-10 h-32 w-32 rounded-full bg-primary/20 blur-2xl" />
					</div>

					<div className="relative p-8 sm:p-10 lg:p-12 space-y-8">
						<div className="flex flex-col lg:flex-row gap-8 lg:items-center">
							<div className="flex gap-6 items-start">
								<div className="relative group shrink-0">
									<div className="absolute -inset-2 rounded-full bg-linear-to-br from-primary/40 via-primary/20 to-transparent blur-2xl opacity-70 group-hover:opacity-100 transition duration-500" />
									<Avatar className="relative h-28 w-28 sm:h-32 sm:w-32 ring-4 ring-background shadow-2xl">
										{profileImageUrl && (
											<AvatarImage src={profileImageUrl} alt={user.name} className="object-cover" />
										)}
										<AvatarFallback className="bg-linear-to-br from-primary to-primary/70 text-primary-foreground text-3xl font-bold">
											{initials}
										</AvatarFallback>
									</Avatar>
								</div>

								<div className="space-y-3">
									<div className="flex flex-wrap items-center gap-3">
										<h1 className="text-3xl sm:text-4xl font-semibold text-foreground leading-tight">
											{user.name}
										</h1>
										{user.emailVerified && (
											<span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary ring-1 ring-primary/30">
												<IconCheck className="h-4 w-4" />
												Verified
											</span>
										)}
									</div>

									<div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
										{user.researchDomain && (
											<span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary">
												<IconFlask className="h-4 w-4" />
												{user.researchDomain}
											</span>
										)}
										{user.institution && (
											<span className="inline-flex items-center gap-2 rounded-full bg-background/60 px-3 py-1">
												<IconBuilding className="h-4 w-4 text-primary" />
												{user.institution}
											</span>
										)}
										<span className="inline-flex items-center gap-2 rounded-full bg-background/60 px-3 py-1">
											<IconCalendar className="h-4 w-4 text-primary" />
											Member since {dateFormatter.format(new Date(user.createdAt))}
										</span>
									</div>

									{user.email && (
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
												<IconMail className="h-4 w-4" />
											</div>
											<a
												href={`mailto:${user.email}`}
												className="hover:text-foreground transition-colors wrap-break-word"
											>
												{user.email}
											</a>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2 space-y-6">
						<div className="rounded-3xl border border-border/60 bg-background/70 backdrop-blur-sm shadow-lg">
							<div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
								<div className="flex items-center gap-2">
									<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
										<IconBook className="h-5 w-5" />
									</span>
									<div>
										<h2 className="text-lg font-semibold text-foreground">Biography</h2>
										<p className="text-xs text-muted-foreground">A quick snapshot of who you are.</p>
									</div>
								</div>
								{user.emailVerified && (
									<Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30 p-2">
										<IconCheck className="mr-1 h-6 w-6" />
										Trusted profile
									</Badge>
								)}
							</div>
							<div className="p-6">
								{user.biography ? (
									<BiographyViewer content={user.biography as JSONContent | string | null} />
								) : (
									<p className="text-sm text-muted-foreground">
										No biography yet. Share your story to help collaborators connect faster.
									</p>
								)}
							</div>
						</div>
					</div>

					<div className="space-y-6">
						<div className="rounded-3xl border border-border/60 bg-background/70 backdrop-blur-sm shadow-lg p-6 space-y-4">
							<h3 className="text-lg font-semibold text-foreground">Contact & identity</h3>
							<div className="space-y-3">
								{user.email && (
									<div className="flex items-center gap-3 text-sm">
										<div className="p-2 rounded-lg bg-primary/10 text-primary">
											<IconMail className="h-4 w-4" />
										</div>
										<a
											href={`mailto:${user.email}`}
											className="text-muted-foreground hover:text-foreground transition-colors wrap-break-word"
										>
											{user.email}
										</a>
									</div>
								)}

								{user.institution && (
									<div className="flex items-center gap-3 text-sm">
										<div className="p-2 rounded-lg bg-muted/50 text-muted-foreground">
											<IconBuilding className="h-4 w-4" />
										</div>
										<span className="text-muted-foreground wrap-break-word">{user.institution}</span>
									</div>
								)}

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
									{user.email && (
										<Button asChild className="rounded-xl shadow-sm hover:shadow-md transition-all">
											<a href={`mailto:${user.email}`}>
												<IconMail className="h-4 w-4 mr-2" />
												Contact
											</a>
										</Button>
									)}
									<Button variant="secondary" className="rounded-xl border-dashed">
										Share profile
									</Button>
								</div>
							</div>
						</div>

						<div className="rounded-3xl border border-border/60 bg-background/70 backdrop-blur-sm shadow-lg p-6 space-y-4">
							<h3 className="text-lg font-semibold text-foreground">Recent participation</h3>
							<div className="space-y-3">
								{recentEvents.length > 0 ? (
									recentEvents.map((event) => {
										const statusToken =
											{
												upcoming: {
													label: "Upcoming",
													classes: "bg-primary/10 text-primary border-primary/30",
												},
												attending: {
													label: "Attending",
													classes: "bg-primary/15 text-primary border-primary/30",
												},
												past: {
													label: "Completed",
													classes: "bg-muted/60 text-muted-foreground border-border/60",
												},
											}[event.status ?? "past"];

										const roleToken =
											{
												speaker: { label: "Speaker", classes: "bg-primary/10 text-primary border-primary/30" },
												reviewer: { label: "Reviewer", classes: "bg-amber-100/20 text-amber-500 border-amber-500/30" },
												committee: { label: "Committee", classes: "bg-indigo-100/20 text-indigo-500 border-indigo-500/30" },
												organizer: { label: "Organizer", classes: "bg-emerald-100/20 text-emerald-600 border-emerald-500/30" },
												admin: { label: "Admin", classes: "bg-rose-100/20 text-rose-600 border-rose-500/30" },
												attendee: { label: "Attendee", classes: "bg-muted/50 text-muted-foreground border-border/60" },
												mentor: { label: "Mentor", classes: "bg-sky-100/20 text-sky-600 border-sky-500/30" },
												judge: { label: "Judge", classes: "bg-purple-100/20 text-purple-600 border-purple-500/30" },
											}[event.role as string] ?? {
												label: event.role ?? "Participant",
												classes: "bg-background/60 text-foreground border-border/50",
											};

										const formattedDate = event.date
											? dateFormatter.format(new Date(event.date))
											: "Date TBA";

										return (
											<div
												key={event.id ?? event.title}
												className="rounded-2xl border border-border/50 bg-muted/30 px-4 py-3 space-y-2"
											>
												<div className="flex items-center justify-between gap-3">
													<div>
														<p className="text-sm font-semibold text-foreground">{event.title}</p>
														{roleToken && (
															<p className="text-xs text-muted-foreground flex items-center gap-2">
																<span
																	className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium ${roleToken.classes}`}
																>
																	{roleToken.label}
																</span>
															</p>
														)}
													</div>
													{statusToken && (
														<span
															className={`text-xs font-medium px-3 py-1 rounded-full border ${statusToken.classes}`}
														>
															{statusToken.label}
														</span>
													)}
												</div>
												<div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
													<span className="inline-flex items-center gap-1 rounded-full bg-background/60 px-2 py-1">
														<IconCalendar className="h-3.5 w-3.5 text-primary" />
														{formattedDate}
													</span>
													{event.location && (
														<span className="inline-flex items-center gap-1 rounded-full bg-background/60 px-2 py-1">
															<IconBuilding className="h-3.5 w-3.5 text-primary" />
															{event.location}
														</span>
													)}
												</div>
											</div>
										);
									})
								) : (
									<p className="text-sm text-muted-foreground">
										No recent events yet. Link your talks or conferences to showcase activity.
									</p>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
