import { IconBuilding, IconMail, IconShare } from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ContactCardProps {
  email: string | null;
  institution: string | null;
  isOwnProfile: boolean;
  isContacting: boolean;
  onContact: () => void;
  onShare: () => void;
}

export function ContactCard({
  email,
  institution,
  isOwnProfile,
  isContacting,
  onContact,
  onShare,
}: ContactCardProps) {
  return (
    <Card className="border-border/60 bg-background/70 rounded-3xl shadow-lg backdrop-blur-sm">
      <CardHeader className="px-6 pt-6 pb-0">
        <CardTitle className="text-lg">Contact & identity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {email && (
          <div className="flex items-center gap-3 text-sm">
            <div className="bg-primary/10 text-primary rounded-lg p-2">
              <IconMail className="h-4 w-4" />
            </div>
            <a
              href={`mailto:${email}`}
              className="text-muted-foreground hover:text-foreground wrap-break-word transition-colors"
            >
              {email}
            </a>
          </div>
        )}

        {institution && (
          <div className="flex items-center gap-3 text-sm">
            <div className="bg-muted/50 text-muted-foreground rounded-lg p-2">
              <IconBuilding className="h-4 w-4" />
            </div>
            <span className="text-muted-foreground wrap-break-word">
              {institution}
            </span>
          </div>
        )}

        <div
          className={cn(
            "grid w-full grid-cols-1 gap-3 pt-2 sm:grid-cols-2",
            isOwnProfile && "sm:grid-cols-1",
          )}
        >
          {email && !isOwnProfile && (
            <Button
              className="rounded-xl shadow-sm transition-all hover:shadow-md"
              onClick={onContact}
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
            className="w-full rounded-xl border-dashed"
            onClick={onShare}
          >
            <IconShare className="mr-2 h-4 w-4" />
            Share profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
