import LoginForm from "./LoginForm"

interface Props {
  searchParams: Promise<{ callbackUrl?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { callbackUrl } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="w-full max-w-sm px-6 py-10 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            관리자 로그인
          </h1>
        </div>
        <LoginForm callbackUrl={callbackUrl ?? "/"} />
      </div>
    </div>
  )
}
