'use client'

import { useEditor, EditorContent, type JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import MenuBar from './MenuBar'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface EditorProps {
  value: JSONContent | string | undefined
  onChange?: (value: JSONContent) => void
  content: JSONContent | undefined
  readOnly?: boolean
  className?: string
  contentClassName?: string
  toolbarClassName?: string
}

const Editor = ({
  value,
  onChange,
  content,
  readOnly = false,
  className,
  contentClassName,
  toolbarClassName,
}: EditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: 'leading-relaxed',
          },
        },
        heading: {
          levels: [1, 2, 3, 4],
          HTMLAttributes: {
            class: 'font-sans',
          },
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none dark:prose-invert',
          readOnly ? 'p-4' : 'min-h-[150px] p-4',
          contentClassName,
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON())
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    if (editor && value) {
      const currentContent = editor.getJSON();
      if (JSON.stringify(currentContent) !== JSON.stringify(value)) {
        editor.commands.setContent(value)
      }
    }
  }, [value, editor])

  if (readOnly) {
    return <EditorContent editor={editor} />
  }

  return (
    <div
      className={cn(
        // TEACHING: Match shadcn input/textarea "field" tokens so this can blend into forms.
        // We use focus-within because the editable element is nested (ProseMirror).
        'border-input flex w-full flex-col rounded-3xl border bg-transparent shadow-xs transition-[color,box-shadow] outline-none',
        'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
        className,
      )}
    >
      <div className={cn('border-input/60 border-b px-3 py-2', toolbarClassName)}>
        <MenuBar editor={editor} />
      </div>
      <div className="p-0">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

export default Editor
