import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

interface Params {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const isAdmin = await getSession()
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { title, content, summary, thumbnail, status, categoryId } = await req.json()

  const post = await prisma.post.update({
    where: { id },
    data: {
      title,
      content,
      summary: summary ?? null,
      thumbnail: thumbnail ?? null,
      status,
      categoryId: categoryId ?? null,
    },
  })

  return NextResponse.json(post)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const isAdmin = await getSession()
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  await prisma.post.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
