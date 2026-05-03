import { prisma } from "@/lib/prisma"
import PostEditor from "@/components/PostEditor"

export default async function WritePage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } })

  return <PostEditor categories={categories} />
}
