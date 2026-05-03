import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function POST(req: NextRequest) {
  const isAdmin = await getSession()
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name } = await req.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: "이름이 필요합니다" }, { status: 400 })
  }

  const category = await prisma.category.upsert({
    where: { name: name.trim() },
    update: {},
    create: { name: name.trim() },
  })

  return NextResponse.json(category, { status: 201 })
}
