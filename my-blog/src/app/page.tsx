import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export default async function HomePage() {
  const isAdmin = await getSession()

  const posts = await prisma.post.findMany({
    where: isAdmin ? undefined : { status: "published" },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  })

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 flex-1">
      {posts.length === 0 ? (
        <p className="text-gray-400 text-center py-24">아직 게시글이 없습니다.</p>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="border-b border-gray-100 dark:border-gray-800 pb-8"
            >
              <Link href={`/posts/${post.id}`} className="group block">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                  {post.category && (
                    <span className="text-gray-500 dark:text-gray-400">
                      {post.category.name}
                    </span>
                  )}
                  <span>
                    {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  {isAdmin && post.status === "draft" && (
                    <span className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded">
                      임시저장
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-[var(--foreground)] group-hover:underline mb-2">
                  {post.title}
                </h2>
                {post.summary && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {post.summary}
                  </p>
                )}
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
