"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"

interface Category {
  id: string
  name: string
}

interface PostEditorProps {
  categories: Category[]
  post?: {
    id: string
    title: string
    content: unknown
    summary: string | null
    status: string
    categoryId: string | null
  }
}

export default function PostEditor({ categories, post }: PostEditorProps) {
  const isEdit = !!post
  const router = useRouter()

  const [title, setTitle] = useState(post?.title ?? "")
  const [summary, setSummary] = useState(post?.summary ?? "")
  const [categoryId, setCategoryId] = useState(post?.categoryId ?? "")
  const [saving, setSaving] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [catList, setCatList] = useState(categories)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "내용을 입력하세요..." }),
    ],
    content: post?.content as object ?? "",
    immediatelyRender: false,
  })

  const handleSave = useCallback(
    async (status: "draft" | "published") => {
      if (!title.trim()) {
        alert("제목을 입력해주세요.")
        return
      }
      setSaving(true)

      const body = {
        title,
        summary: summary || null,
        content: editor?.getJSON() ?? {},
        status,
        categoryId: categoryId || null,
      }

      const url = isEdit ? `/api/posts/${post.id}` : "/api/posts"
      const method = isEdit ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/posts/${isEdit ? post.id : data.id}`)
        router.refresh()
      } else {
        alert("저장에 실패했습니다.")
        setSaving(false)
      }
    },
    [title, summary, categoryId, editor, isEdit, post, router]
  )

  async function handleAddCategory() {
    const name = newCategory.trim()
    if (!name) return
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    if (res.ok) {
      const cat = await res.json()
      setCatList((prev) => [...prev, cat])
      setCategoryId(cat.id)
      setNewCategory("")
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="space-y-4 mb-6">
        <input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-2xl font-bold bg-transparent border-b border-gray-200 dark:border-gray-700 pb-3 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 text-[var(--foreground)] placeholder-gray-300 dark:placeholder-gray-600"
        />

        <input
          type="text"
          placeholder="요약 (선택사항)"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full text-sm bg-transparent border-b border-gray-100 dark:border-gray-800 pb-2 focus:outline-none focus:border-gray-300 dark:focus:border-gray-600 text-[var(--foreground)] placeholder-gray-300 dark:placeholder-gray-600"
        />

        <div className="flex items-center gap-2">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-[var(--foreground)] focus:outline-none"
          >
            <option value="">카테고리 없음</option>
            {catList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="새 카테고리"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
            className="text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-[var(--foreground)] placeholder-gray-400 focus:outline-none w-32"
          />
          <button
            type="button"
            onClick={handleAddCategory}
            className="text-sm px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            추가
          </button>
        </div>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-6">
        <EditorToolbar editor={editor} />
        <div
          className="min-h-[400px] px-4 py-3 cursor-text"
          onClick={() => editor?.chain().focus().run()}
        >
          <EditorContent
            editor={editor}
            className="prose dark:prose-invert max-w-none focus:outline-none min-h-[360px]"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          취소
        </button>
        <button
          type="button"
          onClick={() => handleSave("draft")}
          disabled={saving}
          className="text-sm px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
        >
          임시저장
        </button>
        <button
          type="button"
          onClick={() => handleSave("published")}
          disabled={saving}
          className="text-sm px-4 py-2 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 transition disabled:opacity-50"
        >
          {saving ? "저장 중..." : "발행"}
        </button>
      </div>
    </div>
  )
}

function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> | null }) {
  if (!editor) return null

  const btn = (label: string, action: () => void, active?: boolean) => (
    <button
      type="button"
      onClick={action}
      className={`px-2 py-1 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition ${
        active ? "bg-gray-200 dark:bg-gray-700" : ""
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
      {btn("B", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"))}
      {btn("I", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"))}
      {btn("S", () => editor.chain().focus().toggleStrike().run(), editor.isActive("strike"))}
      {btn("H1", () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive("heading", { level: 1 }))}
      {btn("H2", () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 }))}
      {btn("H3", () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive("heading", { level: 3 }))}
      {btn("• 목록", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"))}
      {btn("1. 목록", () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList"))}
      {btn("인용", () => editor.chain().focus().toggleBlockquote().run(), editor.isActive("blockquote"))}
      {btn("코드", () => editor.chain().focus().toggleCodeBlock().run(), editor.isActive("codeBlock"))}
      {btn("─", () => editor.chain().focus().setHorizontalRule().run())}
    </div>
  )
}
