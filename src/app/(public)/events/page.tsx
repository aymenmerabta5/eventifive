import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconCalendar, IconClock, IconMapPin } from "@tabler/icons-react";
import Image from "next/image";
import eventImage from "@/assets/event-images/download.jpg";

export default function EventsPage() {
	const events = [
		{
			id: 1,
			title: "The Most Popular Science Event",
			category: "Scientific Meeting",
			date: "January 1, 2025",
			time: "10:00 AM",
			location: "Conference Hall A",
			description: "Join us for an exciting scientific meeting featuring cutting-edge research presentations and networking opportunities with leading experts in the field.",
		},
		{
			id: 2,
			title: "Tech Innovation Conference",
			category: "Conference",
			date: "January 15, 2025",
			time: "2:00 PM",
			location: "Main Auditorium",
			description: "Explore the latest technological innovations and trends. Connect with industry leaders and discover groundbreaking solutions shaping the future.",
		},
		{
			id: 3,
			title: "Creative Workshop Series",
			category: "Workshop",
			date: "February 1, 2025",
			time: "9:00 AM",
			location: "Workshop Room B",
			description: "Hands-on learning experience designed to enhance your skills. Interactive sessions with practical exercises and expert guidance.",
		},
	];

	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
				<div className="mb-10 text-center">
					<h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
						Upcoming Events
					</h1>
					<p className="text-muted-foreground text-lg max-w-2xl mx-auto">
						Discover and join our exciting events. Connect, learn, and grow with our community.
					</p>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
					{events.map((event) => (
						<Card
							key={event.id}
							className="group overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 dark:hover:shadow-primary/20"
						>
							{/* Image Section */}
							<div className="relative w-full h-56 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
								<Image
									src={eventImage}
									alt={event.title}
									fill
									className="object-cover group-hover:scale-105 transition-transform duration-500"
								/>
								{/* Gradient Overlay */}
								<div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
								{/* Category Badge */}
								<div className="absolute top-4 right-4">
									<span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/90 text-primary-foreground backdrop-blur-sm">
										{event.category}
									</span>
								</div>
							</div>

							{/* Content Section */}
							<CardHeader className="space-y-3 pb-4">
								<CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
									{event.title}
								</CardTitle>
								
								{/* Event Details */}
								<div className="flex flex-col gap-2.5 pt-2">
									<div className="flex items-center gap-2.5 text-sm text-muted-foreground">
										<IconCalendar className="size-4 text-primary shrink-0" />
										<span className="font-medium">{event.date}</span>
									</div>
									<div className="flex items-center gap-2.5 text-sm text-muted-foreground">
										<IconClock className="size-4 text-primary shrink-0" />
										<span className="font-medium">{event.time}</span>
									</div>
									<div className="flex items-center gap-2.5 text-sm text-muted-foreground">
										<IconMapPin className="size-4 text-primary shrink-0" />
										<span className="font-medium">{event.location}</span>
									</div>
								</div>
							</CardHeader>

							<CardContent className="space-y-4 pt-0">
								<p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
									{event.description}
								</p>
								<Button 
									className="w-full font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors" 
									variant="outline"
								>
									View Details
								</Button>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}
