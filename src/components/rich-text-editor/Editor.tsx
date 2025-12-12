'use client'

import { useEditor, EditorContent, type JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import MenuBar from './MenuBar'
import { useEffect } from 'react'

interface EditorProps {
  value: JSONContent | string | undefined
  onChange?: (value: JSONContent) => void
  content: JSONContent | undefined
  readOnly?: boolean
}

const Editor = ({ value, onChange, content, readOnly = false }: EditorProps) => {
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
            class: "font-sans"
          }
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
        class: readOnly
          ? 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-4 dark:prose-invert'
          : 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[150px] p-4 dark:prose-invert',
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
    <div className="border rounded-md bg-background">
      <MenuBar editor={editor} />
      <div className="border-t p-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

export default Editor
