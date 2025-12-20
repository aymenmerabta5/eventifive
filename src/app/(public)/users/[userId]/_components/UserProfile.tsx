"use client";

import {
  IconBuilding,
  IconFlask,
  IconBook,
  IconMail,
  IconCalendar,
  IconCheck,
  IconShare,
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import Editor from "@/components/rich-text-editor/Editor";
import type { JSONContent } from "@tiptap/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateConversation } from "@/app/messages/_lib/hooks";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/string";
import { formatDateLong } from "@/lib/date";

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
    biography?: unknown;
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
        | "participant"
        | "workshop_facilitator"
        | string;
      status?: "upcoming" | "past" | "attending";
    }[];
  };
}


export default function UserProfile({ user }: UserProfileProps) {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const createConversation = useCreateConversation();
  const [isContacting, setIsContacting] = useState(false);

  const initials = getInitials(user.name);
  const profileImageUrl = user.imageUrl || user.image;
  const recentEvents = (user.recentEvents ?? []).slice(0, 4);

  const handleContact = async () => {
    if (isContacting) return;

    try {
      setIsContacting(true);
      const result = await createConversation.mutateAsync(user.id);
      router.push(`/messages?conversationId=${result.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not start the conversation"
      );
    } finally {
      setIsContacting(false);
    }
  };

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/users/${user.id}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success("Profile link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        {/* Hero */}
        <Card className="border-border/60 from-primary/10 via-background to-background relative overflow-hidden rounded-3xl bg-linear-to-br shadow-xl">
          <div className="pointer-events-none absolute inset-0">
            <div className="bg-primary/15 absolute -top-32 -left-20 h-72 w-72 rounded-full blur-3xl" />
            <div className="bg-primary/10 absolute top-10 right-0 h-60 w-60 rounded-full blur-3xl" />
            <div className="bg-primary/20 absolute bottom-0 left-10 h-32 w-32 rounded-full blur-2xl" />
          </div>

          <CardContent className="relative space-y-8 p-8 sm:p-10 lg:p-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
              <div className="flex items-start gap-6">
                <div className="group relative shrink-0">
                  <div className="from-primary/40 via-primary/20 absolute -inset-2 rounded-full bg-linear-to-br to-transparent opacity-70 blur-2xl transition duration-500 group-hover:opacity-100" />
                  <Avatar className="ring-background relative h-28 w-28 shadow-2xl ring-4 sm:h-32 sm:w-32">
                    {profileImageUrl && (
                      <AvatarImage
                        src={profileImageUrl}
                        alt={user.name}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="from-primary to-primary/70 text-primary-foreground bg-linear-to-br text-3xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-foreground text-3xl leading-tight font-semibold sm:text-4xl">
                      {user.name}
                    </h1>
                  </div>

                  <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
                    {user.researchDomain && (
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary gap-2 rounded-full px-3 py-1"
                      >
                        <IconFlask className="h-4 w-4" />
                        {user.researchDomain}
                      </Badge>
                    )}
                    {user.institution && (
                      <Badge
                        variant="secondary"
                        className="bg-background/60 text-muted-foreground gap-2 rounded-full px-3 py-1"
                      >
                        <IconBuilding className="text-primary h-4 w-4" />
                        {user.institution}
                      </Badge>
                    )}
                    <Badge
                      variant="secondary"
                      className="bg-background/60 text-muted-foreground gap-2 rounded-full px-3 py-1"
                    >
                      <IconCalendar className="text-primary h-4 w-4" />
                      Member since{" "}
                      {formatDateLong(user.createdAt)}
                    </Badge>
                  </div>

                  {user.email && (
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
                        <IconMail className="h-4 w-4" />
                      </div>
                      <a
                        href={`mailto:${user.email}`}
                        className="hover:text-foreground wrap-break-word transition-colors"
                      >
                        {user.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-border/60 bg-background/70 rounded-3xl shadow-lg backdrop-blur-sm">
              <CardHeader className="border-border/50 flex-row items-center justify-between border-b px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-xl">
                    <IconBook className="h-5 w-5" />
                  </span>
                  <div>
                    <CardTitle className="text-foreground text-lg">
                      Biography
                    </CardTitle>
                    <CardDescription className="text-xs">
                      A quick snapshot of who you are.
                    </CardDescription>
                  </div>
                </div>
                {user.emailVerified && (
                  <CardAction>
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary border-primary/30 p-2"
                    >
                      <IconCheck className="mr-1 h-6 w-6" />
                      Trusted profile
                    </Badge>
                  </CardAction>
                )}
              </CardHeader>
              <CardContent>
                {user.biography ? (
                  <Editor
                    value={user.biography as JSONContent | string | undefined}
                    content={user.biography as JSONContent | undefined}
                    readOnly
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No biography yet. Share your story to help collaborators
                    connect faster.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border/60 bg-background/70 rounded-3xl shadow-lg backdrop-blur-sm">
              <CardHeader className="px-6 pt-6 pb-0">
                <CardTitle className="text-lg">Contact & identity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="bg-primary/10 text-primary rounded-lg p-2">
                      <IconMail className="h-4 w-4" />
                    </div>
                    <a
                      href={`mailto:${user.email}`}
                      className="text-muted-foreground hover:text-foreground wrap-break-word transition-colors"
                    >
                      {user.email}
                    </a>
                  </div>
                )}

                {user.institution && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="bg-muted/50 text-muted-foreground rounded-lg p-2">
                      <IconBuilding className="h-4 w-4" />
                    </div>
                    <span className="text-muted-foreground wrap-break-word">
                      {user.institution}
                    </span>
                  </div>
                )}

                <div className={cn("grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2 w-full", session?.user?.id === user.id && "sm:grid-cols-1")}>
                  {user.email && session?.user?.id !== user.id && (
                    <Button
                      className="rounded-xl shadow-sm transition-all hover:shadow-md"
                      onClick={handleContact}
                      disabled={isContacting}
                    >
                      {isContacting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Opening chat...
                        </>
                      ) : (
                        <>
                          <IconMail className="mr-2 h-4 w-4" />
                          Contact
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    className="rounded-xl border-dashed w-full"
                    onClick={handleShareProfile}
                  >
                    <IconShare className="mr-2 h-4 w-4" />
                    Share profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-background/70 rounded-3xl shadow-lg backdrop-blur-sm">
              <CardHeader className="px-6 pt-6 pb-0">
                <CardTitle className="text-lg">Recent participation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentEvents.length > 0 ? (
                  recentEvents.map((event) => {
                    const statusToken = {
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
                        classes:
                          "bg-muted/60 text-muted-foreground border-border/60",
                      },
                    }[event.status ?? "past"];

                    const roleToken = {
                      speaker: {
                        label: "Speaker",
                        classes: "bg-primary/10 text-primary border-primary/30",
                      },
                      reviewer: {
                        label: "Reviewer",
                        classes:
                          "bg-amber-100/20 text-amber-500 border-amber-500/30",
                      },
                      committee: {
                        label: "Committee",
                        classes:
                          "bg-indigo-100/20 text-indigo-500 border-indigo-500/30",
                      },
                      organizer: {
                        label: "Organizer",
                        classes:
                          "bg-emerald-100/20 text-emerald-600 border-emerald-500/30",
                      },
                      admin: {
                        label: "Admin",
                        classes:
                          "bg-rose-100/20 text-rose-600 border-rose-500/30",
                      },
                      attendee: {
                        label: "Attendee",
                        classes:
                          "bg-muted/50 text-muted-foreground border-border/60",
                      },
                      mentor: {
                        label: "Mentor",
                        classes: "bg-sky-100/20 text-sky-600 border-sky-500/30",
                      },
                      judge: {
                        label: "Judge",
                        classes:
                          "bg-purple-100/20 text-purple-600 border-purple-500/30",
                      },
                    }[event.role as string] ?? {
                      label: event.role ?? "Participant",
                      classes:
                        "bg-background/60 text-foreground border-border/50",
                    };

                    const formattedDate = event.date
                      ? formatDateLong(event.date)
                      : "Date TBA";

                    return (
                      <Card
                        key={event.id ?? event.title}
                        className="border-border/50 bg-muted/30 space-y-2 rounded-2xl px-4 py-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-foreground text-sm font-semibold">
                              {event.title}
                            </p>
                            {roleToken && (
                              <p className="text-muted-foreground flex items-center gap-2 text-xs">
                                <Badge
                                  variant="outline"
                                  className={`text-[11px] ${roleToken.classes}`}
                                >
                                  {roleToken.label}
                                </Badge>
                              </p>
                            )}
                          </div>
                          {statusToken && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${statusToken.classes}`}
                            >
                              {statusToken.label}
                            </Badge>
                          )}
                        </div>
                        <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
                          <Badge
                            variant="secondary"
                            className="bg-background/60 gap-1 rounded-full"
                          >
                            <IconCalendar className="text-primary h-3.5 w-3.5" />
                            {formattedDate}
                          </Badge>
                          {event.location && (
                            <Badge
                              variant="secondary"
                              className="bg-background/60 gap-1 rounded-full"
                            >
                              <IconBuilding className="text-primary h-3.5 w-3.5" />
                              {event.location}
                            </Badge>
                          )}
                        </div>
                      </Card>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No recent events yet. Link your talks or conferences to
                    showcase activity.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
