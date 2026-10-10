import type { Key, ReactNode } from "react"

// Minimal read-only renderer for the Tiptap JSON stored in Post.body. Handles
// paragraphs, headings, ordered and bullet lists, blockquotes, inline code and
// code blocks, hard breaks and rules, with bold, italic, inline code and link
// marks. Unknown nodes fall back to rendering their children, never a crash.
// No external dependency.

type Mark = { type?: string; attrs?: { href?: string } }

type Node = {
  type?: string
  text?: string
  marks?: Mark[]
  attrs?: { level?: number } & Record<string, unknown>
  content?: Node[]
}

function safeHref(href: string | undefined): string | null {
  if (!href) return null
  const h = href.trim()
  if (/^(https?:|mailto:|tel:)/i.test(h)) return h
  if (h.startsWith("/") || h.startsWith("#")) return h
  return null
}

function renderText(node: Node, key: Key): ReactNode {
  let el: ReactNode = node.text ?? ""
  for (const mark of node.marks ?? []) {
    if (mark.type === "bold") el = <strong className="font-semibold text-ink">{el}</strong>
    else if (mark.type === "italic") el = <em>{el}</em>
    else if (mark.type === "code")
      el = <code className="rounded-sm bg-surface-sunken px-1 py-0.5 font-mono text-[0.9em] text-ink">{el}</code>
    else if (mark.type === "link") {
      const href = safeHref(mark.attrs?.href)
      const external = !!href && /^https?:/i.test(href)
      el = href ? (
        <a
          href={href}
          className="text-brand underline"
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
        >
          {el}
        </a>
      ) : (
        el
      )
    }
  }
  return <span key={key}>{el}</span>
}

function renderChildren(nodes: Node[] | undefined): ReactNode {
  return (nodes ?? []).map((n, i) => renderNode(n, i))
}

function renderNode(node: Node, key: Key): ReactNode {
  switch (node.type) {
    case "text":
      return renderText(node, key)
    case "paragraph":
      return (
        <p key={key} className="leading-7 text-ink-secondary [&:not(:first-child)]:mt-4">
          {renderChildren(node.content)}
        </p>
      )
    case "heading": {
      const level = node.attrs?.level ?? 2
      if (level <= 2)
        return (
          <h2 key={key} className="font-display text-2xl text-ink [&:not(:first-child)]:mt-10">
            {renderChildren(node.content)}
          </h2>
        )
      if (level === 3)
        return (
          <h3 key={key} className="font-display text-xl text-ink [&:not(:first-child)]:mt-8">
            {renderChildren(node.content)}
          </h3>
        )
      return (
        <h4 key={key} className="font-display text-lg text-ink [&:not(:first-child)]:mt-6">
          {renderChildren(node.content)}
        </h4>
      )
    }
    case "bulletList":
      return (
        <ul key={key} className="list-disc space-y-1 pl-5 text-ink-secondary marker:text-ink-muted [&:not(:first-child)]:mt-4">
          {renderChildren(node.content)}
        </ul>
      )
    case "orderedList":
      return (
        <ol key={key} className="list-decimal space-y-1 pl-5 text-ink-secondary marker:text-ink-muted [&:not(:first-child)]:mt-4">
          {renderChildren(node.content)}
        </ol>
      )
    case "listItem":
      return (
        <li key={key} className="leading-7">
          {renderChildren(node.content)}
        </li>
      )
    case "blockquote":
      return (
        <blockquote key={key} className="border-l-2 border-border-strong pl-4 text-ink-secondary italic [&:not(:first-child)]:mt-4">
          {renderChildren(node.content)}
        </blockquote>
      )
    case "codeBlock":
      return (
        <pre key={key} className="overflow-x-auto rounded-sm bg-surface-sunken p-4 font-mono text-sm text-ink [&:not(:first-child)]:mt-4">
          {renderChildren(node.content)}
        </pre>
      )
    case "hardBreak":
      return <br key={key} />
    case "horizontalRule":
      return <hr key={key} className="border-border [&:not(:first-child)]:mt-8" />
    default:
      return node.content ? <div key={key}>{renderChildren(node.content)}</div> : null
  }
}

function parse(value: unknown): Node | null {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Node
    } catch {
      return null
    }
  }
  return value && typeof value === "object" ? (value as Node) : null
}

export function PostBody({ value }: { value: unknown }) {
  const doc = parse(value)
  const content = doc?.content
  if (!content || content.length === 0) {
    return <p className="leading-7 text-ink-muted">This guide has no content yet.</p>
  }
  return <div className="text-[16px]">{renderChildren(content)}</div>
}
