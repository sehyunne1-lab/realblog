import { put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/x-hwp",
  "application/haansofthwp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(req: NextRequest) {
  const isAdmin = await getSession()
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const form = await req.formData()
  const file = form.get("file") as File | null

  if (!file) return NextResponse.json({ error: "파일이 없습니다" }, { status: 400 })

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "파일 크기는 10MB 이하여야 합니다" }, { status: 400 })
  }

  // hwp는 브라우저가 다양한 MIME 타입으로 전송하므로 확장자도 허용
  const ext = file.name.split(".").pop()?.toLowerCase()
  const isHwp = ext === "hwp"
  if (!ALLOWED_TYPES.includes(file.type) && !isHwp) {
    return NextResponse.json({ error: "허용되지 않는 파일 형식입니다" }, { status: 400 })
  }

  const blob = await put(`comments/${Date.now()}_${file.name}`, file, { access: "public" })

  return NextResponse.json({ url: blob.url, name: file.name, type: file.type })
}
