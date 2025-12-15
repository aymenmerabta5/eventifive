import { CalendarHeader } from "./_components/CalenderHeader";
import { CalendarControls } from "./_components/CalenderControls";
import { CalendarView } from "./_components/CalenderView";

export default function CalendarPage() {
  return (
    <div className="container pt-16 flex flex-col gap-5 mx-auto">
      <h1 className="text-2xl font-bold">Calendar</h1>
      <p className="text-muted-foreground">View and manage your events in a calendar view.</p>
      <div className="h-[calc(100svh-4rem)] overflow-hidden lg:p-2 w-full">
        <div className="lg:border lg:rounded-md overflow-hidden flex flex-col items-center justify-start bg-container h-full w-full bg-background">
          <div className="w-full">
            <CalendarControls />
          </div>
          <div className="flex-1 overflow-hidden w-full">
            <CalendarView />
          </div>
        </div>
      </div>
    </div>
  );
}