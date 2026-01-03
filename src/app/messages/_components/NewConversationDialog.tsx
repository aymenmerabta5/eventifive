"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { useCreateConversation } from "../_lib/hooks";
import { toast } from "sonner";

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated: (conversationId: string) => void;
}

export function NewConversationDialog({
  open,
  onOpenChange,
  onConversationCreated,
}: NewConversationDialogProps) {
  const [name, setName] = useState("");
  const createConversation = useCreateConversation();

  const handleCreateConversation = async () => {
    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    try {
      const result = await createConversation.mutateAsync({ name: name.trim() });
      toast.success(
        result.isNew ? "Conversation created" : "Conversation found",
      );
      setName("");
      onConversationCreated(result.id);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create conversation",
      );
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle>New Conversation</DrawerTitle>
          </DrawerHeader>

          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <label className="text-foreground text-sm font-medium">
                Name
              </label>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  placeholder="Enter name to start conversation..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateConversation();
                    }
                  }}
                />
              </div>
              <p className="text-muted-foreground text-xs">
                Enter the name of the user you want to message
              </p>
            </div>

            <Button
              onClick={handleCreateConversation}
              disabled={!name.trim() || createConversation.isPending}
              className="w-full"
            >
              {createConversation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Starting...
                </>
              ) : (
                "Start Conversation"
              )}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
