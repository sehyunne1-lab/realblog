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

interface Attachment {
  url: string
  name: string
  type: string
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
    attachments?: Attachment[] | null
  }
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]
const MAX_ATTACH_SIZE = 10 * 1024 * 1024

export default function PostEditor({ categories, post }: PostEditorProps) {
  const isEdit = !!post
  const router = useRouter()

  const [title, setTitle] = useState(post?.title ?? "")
  const [summary, setSummary] = useState(post?.summary ?? "")
  const [categoryId, setCategoryId] = useState(post?.categoryId ?? "")
  const [saving, setSaving] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [catList, setCatList] = useState(categories)
  const [attachments, setAttachments] = useState<Attachment[]>(
    Array.isArray(post?.attachments) ? (post.attachments as Attachment[]) : []
  )
  const [attachError, setAttachError] = useState("")
  const [attachUploading, setAttachUploading] = useState(false)
  const attachInputRef = useRef<HTMLInputElement>(null)

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

  async function handleAttachFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setAttachError("")
    if (file.size > MAX_ATTACH_SIZE) {
      setAttachError("파일 크기는 10MB 이하여야 합니다.")
      return
    }
    setAttachUploading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch("/api/upload/comment", { method: "POST", body: form })
      if (!res.ok) {
        const { error } = await res.json()
        setAttachError(error ?? "파일 업로드에 실패했습니다.")
        return
      }
      const data = await res.json()
      setAttachments((prev) => [...prev, { url: data.url, name: data.name, type: data.type }])
    } catch {
      setAttachError("파일 업로드에 실패했습니다.")
    } finally {
      setAttachUploading(false)
    }
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

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
        attachments,
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
    [title, summary, categoryId, attachments, editor, isEdit, post, router]
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

      {/* 파일 첨부 섹션 */}
      <div className="mb-6 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--foreground)]">첨부파일</span>
          <label className="inline-flex items-center gap-1.5 cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
            {attachUploading ? "업로드 중..." : "파일 추가"}
            <input
              ref={attachInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.hwp,.docx"
              className="hidden"
              onChange={handleAttachFile}
              disabled={attachUploading}
            />
          </label>
        </div>

        {attachments.length === 0 && !attachUploading && (
          <p className="text-xs text-gray-400">첨부된 파일이 없습니다. (jpg, png, gif, webp, pdf, hwp, docx · 최대 10MB)</p>
        )}

        {attachments.length > 0 && (
          <ul className="space-y-2">
            {attachments.map((att, i) => (
              <li key={i} className="flex items-center gap-2">
                {IMAGE_TYPES.includes(att.type) ? (
                  <img src={att.url} alt={att.name} className="w-10 h-10 rounded object-cover border border-gray-200 dark:border-gray-700 shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                )}
                <span className="text-sm text-[var(--foreground)] truncate flex-1">{att.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(i)}
                  className="text-gray-400 hover:text-red-500 transition shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}

        {attachError && <p className="text-xs text-red-500">{attachError}</p>}
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

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

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !editor) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: form })
      if (!res.ok) throw new Error("업로드 실패")
      const { url } = await res.json()
      editor.chain().focus().setImage({ src: url }).run()
    } catch {
      alert("이미지 업로드에 실패했습니다.")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

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
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="px-2 py-1 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50"
      >
        {uploading ? "업로드 중..." : "이미지"}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFile}
      />
    </div>
  )
}
