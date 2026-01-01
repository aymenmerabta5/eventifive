import { FileText, Send } from "lucide-react";

interface FormHeaderProps {
  eventTitle?: string;
}

export function FormHeader({ eventTitle }: FormHeaderProps) {
  return (
    <div className="text-center space-y-4">
      {/* Icon */}
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 ring-1 ring-primary/20 shadow-lg shadow-primary/10">
        <FileText className="h-8 w-8 text-primary" />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Call for Papers
        </h1>
        {eventTitle && (
          <p className="text-lg text-primary font-medium">{eventTitle}</p>
        )}
        <p className="mx-auto max-w-lg text-muted-foreground">
          Submit your research paper for review. Fill in the details below and upload your document.
        </p>
      </div>

      {/* Features */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Send className="h-4 w-4 text-primary" />
          <span>One submission per event</span>
        </div>
        <div className="h-1 w-1 rounded-full bg-border" />
        <div className="flex items-center gap-1.5">
          <FileText className="h-4 w-4 text-primary" />
          <span>PDF, DOC, DOCX supported</span>
        </div>
      </div>
    </div>
  );
}
