import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface Params {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id: postId } = await params
  const { content, fileUrl, fileName, fileType } = await req.json()

  if (!content?.trim()) {
    return NextResponse.json({ error: "내용이 필요합니다" }, { status: 400 })
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      postId,
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      fileType: fileType || null,
    },
  })

  return NextResponse.json(comment, { status: 201 })
}
