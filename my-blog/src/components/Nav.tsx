import Link from "next/link"
import { getSession } from "@/lib/session"
import LogoutButton from "./LogoutButton"

export default async function Nav() {
  const isAdmin = await getSession()

  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-semibold text-lg text-[var(--foreground)] hover:opacity-80 transition"
        >
          Blog
        </Link>
        {isAdmin ? (
          <div className="flex items-center gap-4">
            <Link
              href="/write"
              className="text-sm px-3 py-1.5 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 transition"
            >
              글쓰기
            </Link>
            <LogoutButton />
          </div>
        ) : (
          <Link
            href="/login"
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          >
            로그인
          </Link>
        )}
      </div>
    </header>
  )
}
