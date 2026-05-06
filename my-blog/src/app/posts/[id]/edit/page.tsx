import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import PostEditor from "@/components/PostEditor"

interface Props {
  params: Promise<{ id: string }>
}

interface Attachment {
  url: string
  name: string
  type: string
}

export default async function EditPage({ params }: Props) {
  const { id } = await params
  const isAdmin = await getSession()
  if (!isAdmin) redirect("/")

  const [post, categories] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        summary: true,
        thumbnail: true,
        status: true,
        categoryId: true,
        attachments: true,
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ])

  if (!post) notFound()

  return (
    <PostEditor
      categories={categories}
      post={{
        ...post,
        attachments: Array.isArray(post.attachments)
          ? (post.attachments as unknown as Attachment[])
          : null,
      }}
    />
  )
}
