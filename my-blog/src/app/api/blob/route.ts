import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"

export async function GET(req: NextRequest) {
  const isAdmin = await getSession()
  if (!isAdmin) return new NextResponse("Unauthorized", { status: 401 })

  const url = req.nextUrl.searchParams.get("url")
  if (!url || !url.includes(".private.blob.vercel-storage.com")) {
    return new NextResponse("Invalid URL", { status: 400 })
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
  })

  if (!res.ok) return new NextResponse("Not found", { status: 404 })

  const headers = new Headers()
  const ct = res.headers.get("content-type")
  if (ct) headers.set("Content-Type", ct)
  headers.set("Cache-Control", "private, max-age=3600")

  return new NextResponse(res.body, { headers })
}
