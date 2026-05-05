import { put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"

export async function POST(req: NextRequest) {
  const isAdmin = await getSession()
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const form = await req.formData()
  const file = form.get("file") as File | null

  if (!file) return NextResponse.json({ error: "파일이 없습니다" }, { status: 400 })

  const blob = await put(file.name, file, { access: "public" })

  return NextResponse.json({ url: blob.url })
}
