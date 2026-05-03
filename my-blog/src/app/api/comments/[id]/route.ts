import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

interface Params {
  params: Promise<{ id: string }>
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const isAdmin = await getSession()
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  await prisma.comment.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
