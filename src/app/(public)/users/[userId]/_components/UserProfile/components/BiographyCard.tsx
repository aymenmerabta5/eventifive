import { IconBook, IconCheck } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
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

interface BiographyCardProps {
  biography: unknown;
  emailVerified: boolean;
}

export function BiographyCard({
  biography,
  emailVerified,
}: BiographyCardProps) {
  return (
    <Card className="border-border/60 bg-background/70 rounded-3xl shadow-lg backdrop-blur-sm">
      <CardHeader className="border-border/50 flex-row items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-xl">
            <IconBook className="h-5 w-5" />
          </span>
          <div>
            <CardTitle className="text-foreground text-lg">Biography</CardTitle>
            <CardDescription className="text-xs">
              A quick snapshot of who you are.
            </CardDescription>
          </div>
        </div>
        {emailVerified && (
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
        {biography ? (
          <Editor
            value={biography as JSONContent | string | undefined}
            content={biography as JSONContent | undefined}
            readOnly
          />
        ) : (
          <p className="text-muted-foreground text-sm">
            No biography yet. Share your story to help collaborators connect
            faster.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
