"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"

export default function PostContent({ content }: { content: unknown }) {
  const editor = useEditor({
    extensions: [StarterKit, Image, Link.configure({ openOnClick: true })],
    content: content as object,
    editable: false,
    immediatelyRender: false,
  })

  return <EditorContent editor={editor} className="prose dark:prose-invert max-w-none" />
}
