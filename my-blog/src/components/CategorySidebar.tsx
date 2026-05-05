import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import DeleteCategoryButton from "./DeleteCategoryButton"

interface Props {
  activeName?: string
}

export default async function CategorySidebar({ activeName }: Props) {
  const isAdmin = await getSession()

  const [categories, totalCount] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            posts: isAdmin ? true : { where: { status: "published" } },
          },
        },
      },
    }),
    prisma.post.count({
      where: isAdmin ? undefined : { status: "published" },
    }),
  ])

  const visible = isAdmin
    ? categories
    : categories.filter((c) => c._count.posts > 0)

  const linkClass = (active: boolean) =>
    `flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors ${
      active
        ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium"
        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[var(--foreground)]"
    }`

  return (
    <aside className="w-full md:w-48 shrink-0 min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-3 mb-2">
        카테고리
      </p>
      <nav className="flex flex-col gap-0.5">
        <Link href="/" className={linkClass(activeName === undefined)}>
          <span className="truncate">전체</span>
          <span className="text-xs tabular-nums opacity-60 shrink-0 ml-2">{totalCount}</span>
        </Link>
        {visible.map((cat) => (
          <div key={cat.id} className="group relative flex items-center min-w-0">
            <Link
              href={`/category/${encodeURIComponent(cat.name)}`}
              className={linkClass(activeName === cat.name) + " flex-1 min-w-0"}
            >
              <span className="truncate">{cat.name}</span>
              <span className="text-xs tabular-nums opacity-60 shrink-0 ml-2">{cat._count.posts}</span>
            </Link>
            {isAdmin && <DeleteCategoryButton id={cat.id} name={cat.name} />}
          </div>
        ))}
      </nav>
    </aside>
  )
}
