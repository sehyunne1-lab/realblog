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

interface Attachment {
  url: string
  name: string
  type: string
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]

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

  const attachments: Attachment[] = Array.isArray(post.attachments)
    ? (post.attachments as unknown as Attachment[])
    : []

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

        {attachments.length > 0 && (
          <div className="mt-8 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-4">
            <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">첨부파일</h3>
            <ul className="space-y-2">
              {attachments.map((att, i) => (
                <li key={i}>
                  {IMAGE_TYPES.includes(att.type) ? (
                    <a href={att.url} target="_blank" rel="noopener noreferrer" className="block">
                      <img
                        src={att.url}
                        alt={att.name}
                        className="max-h-64 rounded-lg border border-gray-200 dark:border-gray-700 object-contain"
                      />
                      <span className="text-xs text-gray-400 mt-1 block">{att.name}</span>
                    </a>
                  ) : (
                    <a
                      href={att.url}
                      download={att.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                      {att.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

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
