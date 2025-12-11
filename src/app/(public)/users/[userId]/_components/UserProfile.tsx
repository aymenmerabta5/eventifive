"use client";

import { IconBuilding, IconFlask, IconBook, IconMail, IconCalendar, IconCheck } from "@tabler/icons-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

function formatBiography(biography: any): string | null {
	if (!biography) return null;
	
	// If it's a string, return it
	if (typeof biography === "string") {
		return biography;
	}
	
	// If it's an object with content/text, extract it
	if (typeof biography === "object") {
		if (biography.content) {
			// Handle TipTap/ProseMirror format
			if (Array.isArray(biography.content)) {
				return biography.content
					.map((block: any) => {
						if (block.content && Array.isArray(block.content)) {
							return block.content
								.map((item: any) => item.text || "")
								.join("");
						}
						return "";
					})
					.join("\n");
			}
			return typeof biography.content === "string" 
				? biography.content 
				: JSON.stringify(biography.content);
		}
		if (biography.text) {
			return typeof biography.text === "string"
				? biography.text
				: JSON.stringify(biography.text);
		}
		// If it's a plain object, stringify it
		return JSON.stringify(biography);
	}
	
	return null;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
	year: "numeric",
	month: "long",
	day: "numeric",
});

export default function UserProfile({ user }: UserProfileProps) {
	const initials = getInitials(user.name);
	const profileImageUrl = user.imageUrl || user.image;
	const biographyText = formatBiography(user.biography);

	return (
		<div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
			<div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
				{/* Header Card with Gradient Background */}
				<div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 via-primary/5 to-transparent border border-border/50 backdrop-blur-sm mb-8">
					{/* Decorative Elements */}
					<div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
					<div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/3 rounded-full blur-2xl" />
					
					<div className="relative p-8 sm:p-12">
						<div className="flex flex-col sm:flex-row gap-8 items-start">
							{/* Avatar Section */}
							<div className="relative group shrink-0">
								<div className="absolute -inset-2 rounded-full bg-linear-to-br from-primary/30 via-primary/10 to-transparent blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-500" />
								<Avatar className="relative h-32 w-32 sm:h-40 sm:w-40 ring-4 ring-background shadow-2xl">
									{profileImageUrl && (
										<AvatarImage
											src={profileImageUrl}
											alt={user.name}
											className="object-cover"
										/>
									)}
									<AvatarFallback className="bg-linear-to-br from-primary to-primary/70 text-primary-foreground text-3xl sm:text-4xl font-bold">
										{initials}
									</AvatarFallback>
								</Avatar>
								{user.emailVerified && (
									<div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-2 shadow-lg">
										<IconCheck className="h-5 w-5" strokeWidth={3} />
									</div>
								)}
							</div>

							{/* User Info */}
							<div className="flex-1 space-y-4">
								<div>
									<h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
										{user.name}
									</h1>
									{user.researchDomain && (
										<p className="text-lg text-muted-foreground flex items-center gap-2">
											<IconFlask className="h-5 w-5 text-primary" />
											{user.researchDomain}
										</p>
									)}
								</div>

								{/* Quick Info Tags */}
								<div className="flex flex-wrap gap-2">
									{user.institution && (
										<Badge variant="secondary" className="px-3 py-1 text-sm bg-background/80 backdrop-blur-sm border-border/50">
											<IconBuilding className="h-3.5 w-3.5 mr-1.5" />
											{user.institution}
										</Badge>
									)}
									{user.emailVerified && (
										<Badge variant="secondary" className="px-3 py-1 text-sm bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
											<IconCheck className="h-3.5 w-3.5 mr-1.5" strokeWidth={2.5} />
											Verified Account
										</Badge>
									)}
									<Badge variant="secondary" className="px-3 py-1 text-sm bg-background/80 backdrop-blur-sm border-border/50">
										<IconCalendar className="h-3.5 w-3.5 mr-1.5" />
										Member since {dateFormatter.format(new Date(user.createdAt))}
									</Badge>
								</div>

								{/* Action Buttons */}
								<div className="flex flex-wrap gap-3 pt-2">
									{user.email && (
										<Button 
											asChild
											className="rounded-lg shadow-sm hover:shadow-md transition-all"
										>
											<a href={`mailto:${user.email}`}>
												<IconMail className="h-4 w-4 mr-2" />
												Contact
											</a>
										</Button>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Main Content - Left Side */}
					<div className="lg:col-span-2 space-y-8">
						{/* Biography Section */}
						{biographyText && (
							<div className="group rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
								<div className="flex items-center gap-3 mb-6">
									<div className="p-2 rounded-lg bg-primary/10 text-primary">
										<IconBook className="h-5 w-5" />
									</div>
									<h2 className="text-2xl font-semibold text-foreground">About</h2>
								</div>
								<div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap wrap-break-word">
									{biographyText}
								</div>
							</div>
						)}

						{/* Research Domain Section */}
						{user.researchDomain && (
							<div className="group rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
								<div className="flex items-center gap-3 mb-6">
									<div className="p-2 rounded-lg bg-primary/10 text-primary">
										<IconFlask className="h-5 w-5" />
									</div>
									<h2 className="text-2xl font-semibold text-foreground">Research Domain</h2>
								</div>
								<p className="text-muted-foreground leading-relaxed">
									{user.researchDomain}
								</p>
							</div>
						)}
					</div>

					{/* Sidebar - Right Side */}
					<div className="space-y-6">
						{/* Contact Info Card */}
						<div className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-6 space-y-4">
							<h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
							
							<div className="space-y-3">
								{user.email && (
									<div className="flex items-center gap-3 text-sm group/item">
										<div className="p-2 rounded-lg bg-muted/50 text-muted-foreground group-hover/item:bg-primary/10 group-hover/item:text-primary transition-colors">
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
									<div className="flex items-center gap-3 text-sm group/item">
										<div className="p-2 rounded-lg bg-muted/50 text-muted-foreground group-hover/item:bg-primary/10 group-hover/item:text-primary transition-colors">
											<IconBuilding className="h-4 w-4" />
										</div>
										<span className="text-muted-foreground wrap-break-word">
											{user.institution}
										</span>
									</div>
								)}
							</div>
						</div>

						{/* Account Information Card */}
						<div className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-6 space-y-4">
							<h3 className="text-lg font-semibold text-foreground mb-4">Account Information</h3>
							
							<div className="space-y-3">
								<div className="flex items-center gap-3 text-sm group/item">
									<div className="p-2 rounded-lg bg-muted/50 text-muted-foreground group-hover/item:bg-primary/10 group-hover/item:text-primary transition-colors">
										<IconCalendar className="h-4 w-4" />
									</div>
									<div className="flex-1">
										<p className="text-xs text-muted-foreground">Member Since</p>
										<p className="text-sm font-medium text-foreground">
											{dateFormatter.format(new Date(user.createdAt))}
										</p>
									</div>
								</div>
								
								<div className="flex items-center gap-3 text-sm group/item">
									<div className="p-2 rounded-lg bg-muted/50 text-muted-foreground group-hover/item:bg-primary/10 group-hover/item:text-primary transition-colors">
										<IconCalendar className="h-4 w-4" />
									</div>
									<div className="flex-1">
										<p className="text-xs text-muted-foreground">Last Updated</p>
										<p className="text-sm font-medium text-foreground">
											{dateFormatter.format(new Date(user.updatedAt))}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
