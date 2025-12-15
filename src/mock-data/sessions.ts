import { format, addDays, startOfWeek } from "date-fns";


// To the one who seeing this i will delete this later brooo/sisttttaa

export interface Session {
  id: string;
  title: string;
  date: string; // "yyyy-MM-dd"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  speakers: string[];
  meetingLink?: string;
  timezone?: string;
  description?: string;
  location?: string;
  color?: string;
}

// Generate dates relative to current week for demo purposes
const today = new Date();
const weekStart = startOfWeek(today, { weekStartsOn: 0 });

const getDateStr = (daysFromWeekStart: number) =>
  format(addDays(weekStart, daysFromWeekStart), "yyyy-MM-dd");

// Mock sessions representing conference schedule
export const mockSessions: Session[] = [
  // Sunday (Day 0)
  {
    id: "1",
    title: "Registration & Welcome",
    date: getDateStr(0),
    startTime: "08:00",
    endTime: "09:00",
    speakers: ["Staff", "Volunteers"],
    location: "Main Hall",
    description: "Conference registration and welcome packet distribution",
  },
  {
    id: "2",
    title: "Opening Keynote: AI in Research",
    date: getDateStr(0),
    startTime: "09:30",
    endTime: "11:00",
    speakers: ["Dr. Sarah Chen", "Prof. Ahmed Hassan"],
    meetingLink: "https://meet.google.com/abc-defg-hij",
    timezone: "GMT+1",
    location: "Auditorium A",
    description: "Exploring the future of AI-assisted research methodologies",
  },
  {
    id: "3",
    title: "Networking Lunch",
    date: getDateStr(0),
    startTime: "12:00",
    endTime: "13:30",
    speakers: [],
    location: "Dining Hall",
  },
  // Monday (Day 1)
  {
    id: "4",
    title: "Workshop: Machine Learning",
    date: getDateStr(1),
    startTime: "09:00",
    endTime: "12:00",
    speakers: ["Dr. Maria Rodriguez", "John Smith", "Emily Davis"],
    meetingLink: "https://meet.google.com/ml-workshop",
    location: "Workshop Room 1",
    description: "Hands-on workshop covering ML basics",
  },
  {
    id: "5",
    title: "Paper Presentation: Neural Networks",
    date: getDateStr(1),
    startTime: "14:00",
    endTime: "15:30",
    speakers: ["Prof. Wei Zhang", "Dr. Lisa Johnson"],
    location: "Conference Room B",
  },
  {
    id: "6",
    title: "Panel: Ethics in AI",
    date: getDateStr(1),
    startTime: "16:00",
    endTime: "17:30",
    speakers: [
      "Dr. James Wilson",
      "Prof. Fatima Al-Rashid",
      "Dr. Michael Brown",
      "Dr. Anna Kowalski",
    ],
    meetingLink: "https://meet.google.com/ethics-panel",
    location: "Main Hall",
  },
  // Tuesday (Day 2)
  {
    id: "7",
    title: "Morning Coffee & Discussion",
    date: getDateStr(2),
    startTime: "08:30",
    endTime: "09:00",
    speakers: [],
    location: "Lounge Area",
  },
  {
    id: "8",
    title: "Technical Session: Data Science",
    date: getDateStr(2),
    startTime: "09:30",
    endTime: "11:00",
    speakers: ["Dr. Robert Taylor", "Prof. Sophie Martin"],
    location: "Auditorium B",
  },
  {
    id: "9",
    title: "Poster Session",
    date: getDateStr(2),
    startTime: "11:30",
    endTime: "13:00",
    speakers: ["PhD Students", "Researchers"],
    location: "Exhibition Hall",
    description: "Research poster presentations and Q&A",
  },
  {
    id: "10",
    title: "Workshop: Cloud Computing",
    date: getDateStr(2),
    startTime: "14:30",
    endTime: "17:00",
    speakers: ["Tech Team", "Dr. Kevin Park"],
    meetingLink: "https://meet.google.com/cloud-workshop",
    location: "Computer Lab",
  },
  // Wednesday (Day 3)
  {
    id: "11",
    title: "Keynote: Quantum Computing",
    date: getDateStr(3),
    startTime: "09:00",
    endTime: "10:30",
    speakers: ["Prof. David Chen", "Industry Leaders"],
    meetingLink: "https://meet.google.com/quantum-keynote",
    timezone: "GMT+1",
    location: "Auditorium A",
  },
  {
    id: "12",
    title: "Research Collaboration Meeting",
    date: getDateStr(3),
    startTime: "11:00",
    endTime: "12:30",
    speakers: ["Research Teams"],
    location: "Meeting Room C",
  },
  {
    id: "13",
    title: "Industry Partner Showcase",
    date: getDateStr(3),
    startTime: "14:00",
    endTime: "16:00",
    speakers: ["Tech Companies", "Startups"],
    location: "Exhibition Hall",
  },
  {
    id: "14",
    title: "Evening Social Event",
    date: getDateStr(3),
    startTime: "18:00",
    endTime: "21:00",
    speakers: [],
    location: "Rooftop Terrace",
    description: "Networking dinner and entertainment",
  },
  // Thursday (Day 4)
  {
    id: "15",
    title: "Paper Presentations: Track A",
    date: getDateStr(4),
    startTime: "09:00",
    endTime: "11:30",
    speakers: ["Presenters Track A"],
    location: "Conference Room A",
  },
  {
    id: "16",
    title: "Paper Presentations: Track B",
    date: getDateStr(4),
    startTime: "09:00",
    endTime: "11:30",
    speakers: ["Presenters Track B"],
    location: "Conference Room B",
  },
  {
    id: "17",
    title: "Panel: Future of Computing",
    date: getDateStr(4),
    startTime: "13:00",
    endTime: "14:30",
    speakers: ["Industry Experts", "Academics"],
    meetingLink: "https://meet.google.com/future-computing",
    location: "Main Hall",
  },
  {
    id: "18",
    title: "Best Paper Awards",
    date: getDateStr(4),
    startTime: "15:00",
    endTime: "16:00",
    speakers: ["Committee", "Nominees"],
    location: "Auditorium A",
  },
  // Friday (Day 5)
  {
    id: "19",
    title: "Closing Keynote",
    date: getDateStr(5),
    startTime: "09:00",
    endTime: "10:30",
    speakers: ["Prof. Linda Thompson"],
    location: "Auditorium A",
    description: "Conference summary and future directions",
  },
  {
    id: "20",
    title: "Closing Ceremony & Farewell",
    date: getDateStr(5),
    startTime: "11:00",
    endTime: "12:00",
    speakers: ["Organizers"],
    location: "Main Hall",
  },
  // Saturday (Day 6)
  {
    id: "21",
    title: "Optional: City Tour",
    date: getDateStr(6),
    startTime: "10:00",
    endTime: "15:00",
    speakers: [],
    location: "Meet at Hotel Lobby",
    description: "Cultural tour of the city",
  },
];

// Helper function to get sessions for a specific date
export function getSessionsForDate(date: string): Session[] {
  return mockSessions.filter((session) => session.date === date);
}

// Helper function to get today's sessions
export function getTodaySessions(): Session[] {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  return mockSessions.filter((session) => session.date === todayStr);
}

// Helper function to get sessions for a date range
export function getSessionsInRange(startDate: Date, endDate: Date): Session[] {
  const start = format(startDate, "yyyy-MM-dd");
  const end = format(endDate, "yyyy-MM-dd");
  return mockSessions.filter((session) => session.date >= start && session.date <= end);
}
