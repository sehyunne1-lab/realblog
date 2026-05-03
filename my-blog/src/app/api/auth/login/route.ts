import { NextRequest, NextResponse } from "next/server"
import { makeSessionCookie, SESSION_COOKIE } from "@/lib/session"

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "서버 설정 오류: ADMIN_PASSWORD가 설정되지 않았습니다" }, { status: 500 })
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "비밀번호가 틀렸습니다" }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(SESSION_COOKIE, makeSessionCookie(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })
  return response
}
