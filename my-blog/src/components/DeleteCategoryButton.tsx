"use client"

import { useRouter } from "next/navigation"

export default function DeleteCategoryButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`"${name}" 카테고리를 삭제할까요?\n해당 카테고리의 글은 미분류 상태가 됩니다.`)) return

    await fetch(`/api/categories/${id}`, { method: "DELETE" })
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      className="opacity-0 group-hover:opacity-100 ml-1 text-gray-400 hover:text-red-500 transition-opacity text-xs"
      aria-label="삭제"
    >
      ✕
    </button>
  )
}
