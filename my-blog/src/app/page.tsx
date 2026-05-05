import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import CategorySidebar from "@/components/CategorySidebar"

export default async function HomePage() {
  const isAdmin = await getSession()

  if (!isAdmin) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="w-full" style={{ height: "calc(100vh - 3.5rem)" }}>
          {/* 이미지 경로: /main-image.jpg (public 폴더에 교체 가능) */}
          <img
            src="/main-image.webp"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col items-center gap-4 py-10">
          <p className="text-sm text-gray-400">로그인을 해주세요</p>
          <Link
            href="/login"
            className="text-sm px-4 py-2 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 transition"
          >
            로그인
          </Link>
        </div>
      </div>
    )
  }

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 flex-1 w-full">
      <div className="flex flex-col md:flex-row gap-10">
        <CategorySidebar />
        <main className="flex-1 min-w-0">
          {posts.length === 0 ? (
            <p className="text-gray-400 text-center py-24">아직 게시글이 없습니다.</p>
          ) : (
            <div className="space-y-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="border-b border-gray-100 dark:border-gray-800 pb-8"
                >
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                    {post.category && (
                      <Link
                        href={`/category/${encodeURIComponent(post.category.name)}`}
                        className="text-gray-500 dark:text-gray-400 hover:underline"
                      >
                        {post.category.name}
                      </Link>
                    )}
                    <span>
                      {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    {post.status === "draft" && (
                      <span className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded">
                        임시저장
                      </span>
                    )}
                  </div>
                  <Link href={`/posts/${post.id}`} className="group block">
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
      </div>
    </div>
  )
}
