"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"

interface Comment {
  id: string
  content: string
  fileUrl?: string | null
  fileName?: string | null
  fileType?: string | null
  createdAt: Date
}

interface Props {
  postId: string
  comments: Comment[]
  isAdmin: boolean
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]
const MAX_SIZE = 10 * 1024 * 1024

function isImage(type: string | null | undefined) {
  return IMAGE_TYPES.includes(type ?? "")
}

function FilePreview({ url, name, type }: { url: string; name: string; type: string | null | undefined }) {
  if (isImage(type)) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block mt-2">
        <img
          src={url}
          alt={name}
          className="max-h-48 rounded-lg border border-gray-200 dark:border-gray-700 object-contain"
        />
      </a>
    )
  }
  return (
    <a
      href={url}
      download={name}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
      {name}
    </a>
  )
}

export default function CommentSection({ postId, comments: initial, isAdmin }: Props) {
  const [comments, setComments] = useState(initial)
  const [text, setText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState("")
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null
    setFileError("")
    if (!selected) { setFile(null); return }
    if (selected.size > MAX_SIZE) {
      setFileError("파일 크기는 10MB 이하여야 합니다.")
      setFile(null)
      e.target.value = ""
      return
    }
    setFile(selected)
  }

  function removeFile() {
    setFile(null)
    setFileError("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)

    let fileUrl: string | null = null
    let fileName: string | null = null
    let fileType: string | null = null

    if (file) {
      setUploading(true)
      const form = new FormData()
      form.append("file", file)
      const res = await fetch("/api/upload/comment", { method: "POST", body: form })
      setUploading(false)
      if (!res.ok) {
        const { error } = await res.json()
        setFileError(error ?? "파일 업로드에 실패했습니다.")
        setLoading(false)
        return
      }
      const data = await res.json()
      fileUrl = data.url
      fileName = data.name
      fileType = data.type
    }

    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text, fileUrl, fileName, fileType }),
    })

    if (res.ok) {
      const newComment = await res.json()
      setComments((prev) => [...prev, newComment])
      setText("")
      removeFile()
    }
    setLoading(false)
  }

  async function handleDelete(commentId: string) {
    if (!confirm("댓글을 삭제하시겠습니까?")) return
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" })
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      router.refresh()
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-6">
        댓글 {comments.length > 0 && <span className="text-gray-500 font-normal text-base">({comments.length})</span>}
      </h2>

      <div className="space-y-4 mb-8">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-400">아직 댓글이 없습니다.</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3"
            >
              <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">{comment.content}</p>
              {comment.fileUrl && comment.fileName && (
                <FilePreview url={comment.fileUrl} name={comment.fileName} type={comment.fileType} />
              )}
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {isAdmin && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="댓글을 입력하세요..."
            rows={3}
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-[var(--foreground)] placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 resize-none transition"
          />

          {/* 파일 첨부 영역 */}
          <div className="flex items-center gap-3 flex-wrap">
            <label className="inline-flex items-center gap-1.5 cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
              파일 첨부
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.hwp,.docx"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {file && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5">
                <span className="truncate max-w-[200px]">{file.name}</span>
                <button type="button" onClick={removeFile} className="text-gray-400 hover:text-red-500 transition shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {fileError && <p className="text-xs text-red-500">{fileError}</p>}

          <button
            type="submit"
            disabled={loading || uploading || !text.trim()}
            className="text-sm px-4 py-2 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 transition disabled:opacity-50"
          >
            {uploading ? "파일 업로드 중..." : loading ? "등록 중..." : "댓글 등록"}
          </button>
        </form>
      )}
    </div>
  )
}
