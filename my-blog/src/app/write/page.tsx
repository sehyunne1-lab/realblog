import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import PostEditor from "@/components/PostEditor"

export default async function WritePage() {
  const isAdmin = await getSession()
  if (!isAdmin) redirect("/login?callbackUrl=/write")

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } })

  return <PostEditor categories={categories} />
}
