"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Comment {
  id: string
  content: string
  createdAt: Date
}

interface Props {
  postId: string
  comments: Comment[]
  isAdmin: boolean
}

export default function CommentSection({ postId, comments: initial, isAdmin }: Props) {
  const [comments, setComments] = useState(initial)
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)

    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    })

    if (res.ok) {
      const newComment = await res.json()
      setComments((prev) => [...prev, newComment])
      setText("")
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
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="text-sm px-4 py-2 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 transition disabled:opacity-50"
          >
            {loading ? "등록 중..." : "댓글 등록"}
          </button>
        </form>
      )}
    </div>
  )
}
