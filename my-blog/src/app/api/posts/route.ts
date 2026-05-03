import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function POST(req: NextRequest) {
  const isAdmin = await getSession()
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { title, content, summary, status, categoryId } = await req.json()
  if (!title) return NextResponse.json({ error: "제목이 필요합니다" }, { status: 400 })

  const post = await prisma.post.create({
    data: {
      title,
      content,
      summary: summary ?? null,
      status: status ?? "draft",
      categoryId: categoryId ?? null,
    },
  })

  return NextResponse.json(post, { status: 201 })
}
