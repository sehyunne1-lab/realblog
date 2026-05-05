type TiptapNode = {
  type?: string
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
