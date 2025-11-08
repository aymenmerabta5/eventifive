import EventRow from "./_components/EventRow";

export default function EventsPage() {
  const events = [
    {
      id: 1,
      title: "The Most Popular Science Event",
      category: "Scientific Meeting",
      date: "January 1, 2025",
      time: "10:00 AM",
      location: "Conference Hall A",
      description:
        "Join us for an exciting scientific meeting featuring cutting-edge research presentations and networking opportunities with leading experts in the field.",
    },
    {
      id: 2,
      title: "Tech Innovation Conference",
      category: "Conference",
      date: "January 15, 2025",
      time: "2:00 PM",
      location: "Main Auditorium",
      description:
        "Explore the latest technological innovations and trends. Connect with industry leaders and discover groundbreaking solutions shaping the future.",
    },
    {
      id: 3,
      title: "Creative Workshop Series",
      category: "Workshop",
      date: "February 1, 2025",
      time: "9:00 AM",
      location: "Workshop Room B",
      description:
        "Hands-on learning experience designed to enhance your skills. Interactive sessions with practical exercises and expert guidance.",
    },
  ] as const;

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="mb-10 text-center">
          <h1 className="from-primary to-primary/60 mb-3 bg-linear-to-r bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
            Upcoming Events
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Discover and join our exciting events. Connect, learn, and grow with
            our community.
          </p>
        </div>
        <div className="flex flex-col gap-10">
          <EventRow
            events={events}
            title="Congress"
            description="Join us for an exciting scientific meeting featuring cutting-edge research presentations and networking opportunities with leading experts in the field."
            route="/events/congress"
          />
          <EventRow
            events={events}
            title="Seminar"
            description="Explore the latest technological innovations and trends. Connect with industry leaders and discover groundbreaking solutions shaping the future."
            route="/events/seminar"
          />
          <EventRow
            events={events}
            title="Workshop"
            description="Hands-on learning experience designed to enhance your skills. Interactive sessions with practical exercises and expert guidance."
            route="/events/workshop"
          />
        </div>
      </div>
    </div>
  );
}
