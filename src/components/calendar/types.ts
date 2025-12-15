import type { ProgramSession, Room } from "@/server/db/schema";

// Extended session type with relations
export interface SessionWithRelations extends ProgramSession {
  room: {
    id: number;
    name: string;
    capacity: number | null;
    location: string | null;
  } | null;
  chair: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
}

// Chair option for dropdown
export interface ChairOption {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

// Props for the main calendar view
export interface CalendarViewProps {
  eventId: string;
  sessions: SessionWithRelations[];
  rooms: Room[];
  eventStartDate: Date;
  eventEndDate: Date;
  chairOptions: ChairOption[];
  onCreateSession?: (data: CreateSessionData) => void;
  onUpdateSession?: (data: UpdateSessionData) => void;
  onDeleteSession?: (sessionId: string) => void;
  isEditable?: boolean;
  isLoading?: boolean;
}

// Data for creating a session
export interface CreateSessionData {
  eventId: string;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  roomId?: number | null;
  chairId?: string | null;
  meetingLink?: string | null;
}

// Data for updating a session
export interface UpdateSessionData {
  sessionId: string;
  title?: string;
  description?: string | null;
  startAt?: string;
  endAt?: string;
  roomId?: number | null;
  chairId?: string | null;
  meetingLink?: string | null;
}

// Props for session card
export interface SessionCardProps {
  session: SessionWithRelations;
  style: React.CSSProperties;
  onClick?: () => void;
  isEditable?: boolean;
}

// Props for session sheet/detail view
export interface SessionSheetProps {
  session: SessionWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
}

// Props for create/edit session dialog
export interface SessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventStartDate: Date;
  eventEndDate: Date;
  rooms: Room[];
  chairOptions: ChairOption[];
  session?: SessionWithRelations | null; // If provided, edit mode
  onSubmit: (data: CreateSessionData | UpdateSessionData) => void;
  isSubmitting?: boolean;
}

// Props for calendar week header
export interface CalendarWeekHeaderProps {
  weekDays: Date[];
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
}

// Props for calendar day column
export interface CalendarDayColumnProps {
  day: Date;
  dayIndex: number;
  sessions: SessionWithRelations[];
  today: Date;
  isTodayInWeek: boolean;
  currentTime: Date;
  onScroll: (index: number) => (e: React.UIEvent<HTMLDivElement>) => void;
  scrollRef: (el: HTMLDivElement | null) => void;
  onSessionClick: (session: SessionWithRelations) => void;
  onEmptySlotClick?: (date: Date, hour: number) => void;
  isEditable?: boolean;
}

// Props for hours column
export interface CalendarHoursColumnProps {
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}
