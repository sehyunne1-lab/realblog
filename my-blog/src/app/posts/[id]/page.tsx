import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import PostContent from "@/components/PostContent"
import PostActions from "@/components/PostActions"
import CommentSection from "@/components/CommentSection"
import { extractFirstImage } from "@/lib/extractFirstImage"

interface Props {
  params: Promise<{ id: string }>
}

export default async function PostPage({ params }: Props) {
  const { id } = await params
  const isAdmin = await getSession()

  if (!isAdmin) redirect("/")

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      category: true,
      comments: { orderBy: { createdAt: "asc" } },
    },
  })

  if (!post || (!isAdmin && post.status !== "published")) {
    notFound()
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 flex-1">
      <article>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
          {post.category && <span>{post.category.name}</span>}
          <span>
            {new Date(post.createdAt).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          {post.status === "draft" && (
            <span className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded text-xs">
              임시저장
            </span>
          )}
        </div>

        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-8">{post.title}</h1>

        {(() => {
          const img = post.thumbnail ?? extractFirstImage(post.content)
          return img ? (
            <img src={img} alt="" className="w-full max-h-80 object-cover rounded-xl mb-8" />
          ) : null
        })()}

        <PostContent content={post.content} />

        {isAdmin && <PostActions postId={post.id} />}
      </article>

      <div className="mt-14 pt-8 border-t border-gray-200 dark:border-gray-800">
        <CommentSection
          postId={post.id}
          comments={post.comments.map((c) => ({
            ...c,
            createdAt: new Date(c.createdAt),
          }))}
          isAdmin={isAdmin}
        />
      </div>
    </main>
  )
}
