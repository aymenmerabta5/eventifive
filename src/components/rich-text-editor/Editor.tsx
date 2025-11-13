'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import MenuBar from './MenuBar'

const Editor = () => {
  const editor = useEditor({
    extensions: [StarterKit, TextAlign.configure({
      types: ['heading', 'paragraph'],
    })],
    content: '',
    immediatelyRender: false,
  })

  return (
    <div>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

export default Editor