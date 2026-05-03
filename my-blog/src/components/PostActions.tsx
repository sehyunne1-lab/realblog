"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

export default function PostActions({ postId }: { postId: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm("정말 삭제하시겠습니까?")) return
    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" })
    if (res.ok) {
      router.push("/")
      router.refresh()
    }
  }

  return (
    <div className="flex gap-3 mt-10 pt-6 border-t border-gray-100 dark:border-gray-800">
      <Link
        href={`/posts/${postId}/edit`}
        className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      >
        수정
      </Link>
      <button
        onClick={handleDelete}
        className="text-sm px-3 py-1.5 rounded-lg border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
      >
        삭제
      </button>
    </div>
  )
}
