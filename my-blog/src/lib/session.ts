import { createHmac, timingSafeEqual } from "crypto"
import { cookies } from "next/headers"

export const SESSION_COOKIE = "admin_session"
const TOKEN = "authenticated"

function sign(value: string): string {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error("AUTH_SECRET is not set")
  return createHmac("sha256", secret).update(value).digest("base64url")
}

export function makeSessionCookie(): string {
  return `${TOKEN}.${sign(TOKEN)}`
}

export async function getSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(SESSION_COOKIE)?.value
  if (!raw) return false

  const dotIndex = raw.lastIndexOf(".")
  if (dotIndex === -1) return false

  const value = raw.slice(0, dotIndex)
  const sig = raw.slice(dotIndex + 1)

  try {
    const expected = sign(value)
    const sigBuf = Buffer.from(sig)
    const expBuf = Buffer.from(expected)
    if (sigBuf.length !== expBuf.length) return false
    return value === TOKEN && timingSafeEqual(sigBuf, expBuf)
  } catch {
    return false
  }
}
