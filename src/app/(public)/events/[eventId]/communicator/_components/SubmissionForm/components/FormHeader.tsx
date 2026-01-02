import { FileText, Send } from "lucide-react";

interface FormHeaderProps {
  eventTitle?: string;
}

export function FormHeader({ eventTitle }: FormHeaderProps) {
  return (
    <div className="space-y-4 text-center">
      {/* Icon */}
      <div className="from-primary/20 via-primary/10 to-primary/5 ring-primary/20 shadow-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg ring-1">
        <FileText className="text-primary h-8 w-8" />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Call for Papers
        </h1>
        {eventTitle && (
          <p className="text-primary text-lg font-medium">{eventTitle}</p>
        )}
        <p className="text-muted-foreground mx-auto max-w-lg">
          Submit your research paper for review. Fill in the details below and
          upload your document.
        </p>
      </div>

      {/* Features */}
      <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <Send className="text-primary h-4 w-4" />
          <span>One submission per event</span>
        </div>
        <div className="bg-border h-1 w-1 rounded-full" />
        <div className="flex items-center gap-1.5">
          <FileText className="text-primary h-4 w-4" />
          <span>PDF, DOC, DOCX supported</span>
        </div>
      </div>
    </div>
  );
}
