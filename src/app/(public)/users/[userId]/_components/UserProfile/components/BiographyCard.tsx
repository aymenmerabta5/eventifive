"use client";

import { IconBook, IconPencil, IconSparkles } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import Editor from "@/components/rich-text-editor/Editor";
import Link from "next/link";
import type { JSONContent } from "@tiptap/react";

interface BiographyCardProps {
  biography: unknown;
  emailVerified: boolean;
  isOwnProfile?: boolean;
}

export function BiographyCard({ biography, isOwnProfile }: BiographyCardProps) {
  const hasBiography = biography !== null && biography !== undefined;

  return (
    <div className="group border-border/50 bg-card/50 hover:border-border hover:shadow-primary/5 relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
      {/* Subtle gradient accent */}
      <div className="from-primary/60 via-primary to-primary/60 absolute top-0 right-0 left-0 h-1 bg-gradient-to-r" />

      {/* Header */}
      <div className="border-border/50 flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex size-10 items-center justify-center rounded-xl">
            <IconBook className="text-primary size-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">About</h3>
            <p className="text-muted-foreground text-xs">
              Professional background & interests
            </p>
          </div>
        </div>
        {isOwnProfile && (
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-2 rounded-full"
          >
            <Link href="/settings">
              <IconPencil className="size-4" />
              Edit
            </Link>
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="px-6 py-5">
        {hasBiography ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <Editor
              value={biography as JSONContent | string | undefined}
              content={biography as JSONContent | undefined}
              readOnly
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="relative mb-4">
              <div className="bg-muted/50 absolute inset-0 scale-150 rounded-full blur-xl" />
              <div className="border-border/50 bg-card relative flex size-16 items-center justify-center rounded-2xl border">
                <IconSparkles className="text-muted-foreground size-7" />
              </div>
            </div>
            <p className="text-muted-foreground max-w-xs text-sm">
              {isOwnProfile
                ? "Share your story to help collaborators connect with you."
                : "This user hasn't added a biography yet."}
            </p>
            {isOwnProfile && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="mt-4 gap-2 rounded-full"
              >
                <Link href="/settings">
                  <IconPencil className="size-4" />
                  Add Biography
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
