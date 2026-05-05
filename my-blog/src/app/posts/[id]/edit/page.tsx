import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import PostEditor from "@/components/PostEditor"

interface Props {
  params: Promise<{ id: string }>
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
        status: true,
        categoryId: true,
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ])

  if (!post) notFound()

  return <PostEditor categories={categories} post={post} />
}
