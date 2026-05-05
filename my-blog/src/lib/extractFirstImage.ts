type TiptapNode = {
  type?: string
  text?: string
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
}

export function extractFirstImage(content: unknown): string | null {
  const node = content as TiptapNode
  if (!node || typeof node !== "object") return null
  if (node.type === "image" && typeof node.attrs?.src === "string") {
    return node.attrs.src
  }
  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      const found = extractFirstImage(child)
      if (found) return found
    }
  }
  return null
}

export function extractTextExcerpt(content: unknown, maxLength = 120): string {
  const parts: string[] = []

  function traverse(node: unknown) {
    const n = node as TiptapNode
    if (!n || typeof n !== "object") return
    if (n.type === "image" || n.type === "codeBlock") return
    if (n.text) parts.push(n.text)
    if (Array.isArray(n.content)) n.content.forEach(traverse)
  }

  traverse(content)
  const text = parts.join("").replace(/\s+/g, " ").trim()
  return text.length > maxLength ? text.slice(0, maxLength) + "…" : text
}
