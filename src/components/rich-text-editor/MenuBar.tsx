import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import {
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  TextIcon,
  ListIcon,
  ListOrderedIcon,
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
} from "lucide-react";
import { type Editor, useEditorState } from "@tiptap/react";
import { Toggle } from "../ui/toggle";
import { cn } from "@/lib/utils";

export default function MenuBar({ editor }: { editor: Editor | null }) {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isBold: ctx.editor?.isActive("bold") ?? false,
        canBold: ctx.editor?.can().chain().toggleBold().run() ?? false,
        isItalic: ctx.editor?.isActive("italic") ?? false,
        canItalic: ctx.editor?.can().chain().toggleItalic().run() ?? false,
        isStrike: ctx.editor?.isActive("strike") ?? false,
        canStrike: ctx.editor?.can().chain().toggleStrike().run() ?? false,
        isCode: ctx.editor?.isActive("code") ?? false,
        canCode: ctx.editor?.can().chain().toggleCode().run() ?? false,
        canClearMarks: ctx.editor?.can().chain().unsetAllMarks().run() ?? false,
        isParagraph: ctx.editor?.isActive("paragraph") ?? false,
        isHeading1: ctx.editor?.isActive("heading", { level: 1 }) ?? false,
        isHeading2: ctx.editor?.isActive("heading", { level: 2 }) ?? false,
        isHeading3: ctx.editor?.isActive("heading", { level: 3 }) ?? false,
        isHeading4: ctx.editor?.isActive("heading", { level: 4 }) ?? false,
        isHeading5: ctx.editor?.isActive("heading", { level: 5 }) ?? false,
        isHeading6: ctx.editor?.isActive("heading", { level: 6 }) ?? false,
        isBulletList: ctx.editor?.isActive("bulletList") ?? false,
        isOrderedList: ctx.editor?.isActive("orderedList") ?? false,
        isCodeBlock: ctx.editor?.isActive("codeBlock") ?? false,
        isBlockquote: ctx.editor?.can().chain().undo().run() ?? false,
        canRedo: ctx.editor?.can().chain().redo().run() ?? false,
        isAlignLeft: ctx.editor?.isActive({ textAlign: "left" }) ?? false,
        isAlignCenter: ctx.editor?.isActive({ textAlign: "center" }) ?? false,
        isAlignRight: ctx.editor?.isActive({ textAlign: "right" }) ?? false,
      };
    },
  });
  if (!editor) return null;
  return (
    <div className="flex flex-wrap items-center gap-1 p-2">
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              variant="outline"
              pressed={editorState?.isBold}
              onPressedChange={() => {
                editor.chain().focus().toggleBold().run();
              }}
              className={cn(
                "cursor-pointer",
                editorState?.isBold && "bg-primary text-primary-foreground",
              )}
            >
              <BoldIcon className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Bold</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              variant="outline"
              pressed={editorState?.isItalic}
              onPressedChange={() => {
                editor.chain().focus().toggleItalic().run();
              }}
              className={cn(
                "cursor-pointer",
                editorState?.isItalic && "bg-primary text-primary-foreground",
              )}
            >
              <ItalicIcon className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Italic</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              variant="outline"
              pressed={editorState?.isStrike}
              onPressedChange={() => {
                editor.chain().focus().toggleStrike().run();
              }}
              className={cn(
                "cursor-pointer",
                editorState?.isStrike && "bg-primary text-primary-foreground",
              )}
            >
              <StrikethroughIcon className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Strike</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              variant="outline"
              pressed={editorState?.isParagraph}
              onPressedChange={() => {
                editor.chain().focus().setParagraph().run();
              }}
              className={cn(
                "cursor-pointer",
                editorState?.isParagraph && "bg-primary text-primary-foreground",
              )}
            >
              <TextIcon className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Paragraph</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              variant="outline"
              pressed={editorState?.isHeading1}
              onPressedChange={() => {
                editor.chain().focus().toggleHeading({ level: 1 }).run();
              }}
              className={cn(
                "cursor-pointer",
                editorState?.isHeading1 && "bg-primary text-primary-foreground",
              )}
            >
              <Heading1Icon className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Heading 1</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              variant="outline"
              pressed={editorState?.isHeading2}
              onPressedChange={() => {
                editor.chain().focus().toggleHeading({ level: 2 }).run();
              }}
              className={cn(
                "cursor-pointer",
                editorState?.isHeading2 && "bg-primary text-primary-foreground",
              )}
            >
              <Heading2Icon className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Heading 2</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              variant="outline"
              pressed={editorState?.isHeading3}
              onPressedChange={() => {
                editor.chain().focus().toggleHeading({ level: 3 }).run();
              }}
              className={cn(
                "cursor-pointer",
                editorState?.isHeading3 && "bg-primary text-primary-foreground",
              )}
            >
              <Heading3Icon className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Heading 3</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              variant="outline"
              pressed={editorState?.isHeading3}
              onPressedChange={() => {
                editor.chain().focus().toggleHeading({ level: 4 }).run();
              }}
              className={cn(
                "cursor-pointer",
                editorState?.isHeading4 && "bg-primary text-primary-foreground",
              )}
            >
              <Heading4Icon className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Heading 4</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              variant="outline"
              pressed={editorState?.isBulletList}
              onPressedChange={() => {
                editor.chain().focus().toggleBulletList().run();
              }}
              className={cn(
                "cursor-pointer",
                editorState?.isBulletList &&
                  "bg-primary text-primary-foreground",
              )}
            >
              <ListIcon className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Bullet List</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              variant="outline"
              pressed={editorState?.isOrderedList}
              onPressedChange={() => {
                editor.chain().focus().toggleOrderedList().run();
              }}
              className={cn(
                "cursor-pointer",
                editorState?.isOrderedList &&
                  "bg-primary text-primary-foreground",
              )}
            >
              <ListOrderedIcon className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Ordered List</TooltipContent>
        </Tooltip>
      </div>
      <div className="w-px h-6 bg-border mx-2" />
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              variant="outline"
              pressed={editorState?.isAlignLeft}
              onPressedChange={() => {
                editor.chain().focus().setTextAlign("left").run();
              }}
              className={cn(
                "cursor-pointer",
                editorState?.isAlignLeft && "bg-primary text-primary-foreground",
              )}
            >
              <AlignLeftIcon className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Align Left</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              variant="outline"
              pressed={editorState?.isAlignCenter}
              onPressedChange={() => {
                editor.chain().focus().setTextAlign("center").run();
              }}
              className={cn(
                "cursor-pointer",
                editorState?.isAlignCenter && "bg-primary text-primary-foreground",
              )}
            >
              <AlignCenterIcon className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Align Center</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              variant="outline"
              pressed={editorState?.isAlignRight}
              onPressedChange={() => {
                editor.chain().focus().setTextAlign("right").run();
              }}
              className={cn(
                "cursor-pointer",
                editorState?.isAlignRight && "bg-primary text-primary-foreground",
              )}
            >
              <AlignRightIcon className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Align Right</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
