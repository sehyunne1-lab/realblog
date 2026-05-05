import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import PostEditor from "@/components/PostEditor"

export default async function WritePage() {
  const isAdmin = await getSession()
  if (!isAdmin) redirect("/")

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } })

  return <PostEditor categories={categories} />
}
