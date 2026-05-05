import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import CategorySidebar from "@/components/CategorySidebar"

interface Props {
  params: Promise<{ name: string }>
}

export async function generateMetadata({ params }: Props) {
  const { name } = await params
  return { title: `${decodeURIComponent(name)} — Blog` }
}

export default async function CategoryPage({ params }: Props) {
  const { name } = await params
  const categoryName = decodeURIComponent(name)
  const isAdmin = await getSession()

  if (!isAdmin) redirect("/")

  const category = await prisma.category.findUnique({
    where: { name: categoryName },
  })

  if (!category) notFound()

  const posts = await prisma.post.findMany({
    where: { categoryId: category.id },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 flex-1 w-full">
      <div className="flex flex-col md:flex-row gap-10">
        <CategorySidebar activeName={categoryName} />
        <main className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-8">{categoryName}</h1>
          {posts.length === 0 ? (
            <p className="text-gray-400 text-center py-24">이 카테고리에 게시글이 없습니다.</p>
          ) : (
            <div className="space-y-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="border-b border-gray-100 dark:border-gray-800 pb-8"
                >
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
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
                  <Link href={`/posts/${post.id}`} className="group flex gap-4 items-start">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-semibold text-[var(--foreground)] group-hover:underline mb-2">
                        {post.title}
                      </h2>
                      {post.summary && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {post.summary}
                        </p>
                      )}
                    </div>
                    {post.thumbnail && (
                      <img
                        src={post.thumbnail}
                        alt=""
                        className="w-24 h-16 object-cover rounded-lg flex-shrink-0"
                      />
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
