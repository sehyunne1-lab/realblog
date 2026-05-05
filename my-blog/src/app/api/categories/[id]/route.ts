import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await getSession()
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  await prisma.post.updateMany({
    where: { categoryId: id },
    data: { categoryId: null },
  })

  await prisma.category.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
