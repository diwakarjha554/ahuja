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
      el = <code className="rounded-sm border border-border bg-surface-raised px-1.5 py-0.5 font-mono text-[0.88em] text-ink">{el}</code>
    else if (mark.type === "link") {
      const href = safeHref(mark.attrs?.href)
      const external = !!href && /^https?:/i.test(href)
      el = href ? (
        <a
          href={href}
          className="font-medium text-brand underline decoration-brand/50 decoration-2 underline-offset-4 transition-colors hover:decoration-brand"
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
        <p key={key} className="leading-[1.75] text-ink-secondary [&:not(:first-child)]:mt-5">
          {renderChildren(node.content)}
        </p>
      )
    case "heading": {
      const level = node.attrs?.level ?? 2
      if (level <= 2)
        return (
          <h2 key={key} className="type-poster text-[clamp(34px,3.6vw,52px)] text-ink [&:not(:first-child)]:mt-14">
            {renderChildren(node.content)}
          </h2>
        )
      if (level === 3)
        return (
          <h3 key={key} className="font-display text-[22px] leading-snug font-bold tracking-[-0.01em] text-ink [&:not(:first-child)]:mt-10">
            {renderChildren(node.content)}
          </h3>
        )
      return (
        <h4 key={key} className="font-display text-lg font-bold text-ink [&:not(:first-child)]:mt-8">
          {renderChildren(node.content)}
        </h4>
      )
    }
    case "bulletList":
      return (
        <ul key={key} className="list-disc space-y-2 pl-5 text-ink-secondary marker:text-brand-accent [&:not(:first-child)]:mt-5">
          {renderChildren(node.content)}
        </ul>
      )
    case "orderedList":
      return (
        <ol key={key} className="list-decimal space-y-2 pl-6 text-ink-secondary marker:font-mono marker:font-semibold marker:text-brand-accent [&:not(:first-child)]:mt-5">
          {renderChildren(node.content)}
        </ol>
      )
    case "listItem":
      return (
        <li key={key} className="pl-1 leading-[1.75]">
          {renderChildren(node.content)}
        </li>
      )
    case "blockquote":
      return (
        <blockquote key={key} className="border-l-4 border-brand-accent bg-surface-sunken py-4 pr-4 pl-5 text-[1.05em] text-ink [&:not(:first-child)]:mt-8">
          {renderChildren(node.content)}
        </blockquote>
      )
    case "codeBlock":
      return (
        <pre key={key} className="overflow-x-auto rounded-sm border border-border bg-surface-sunken p-4 font-mono text-sm leading-relaxed text-ink [&:not(:first-child)]:mt-6">
          {renderChildren(node.content)}
        </pre>
      )
    case "hardBreak":
      return <br key={key} />
    case "horizontalRule":
      return <hr key={key} className="border-border-strong [&:not(:first-child)]:my-12" />
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
    return <p className="text-[17px] leading-[1.75] text-ink-muted">This guide has no content yet.</p>
  }
  return <div className="text-[17px] text-pretty">{renderChildren(content)}</div>
}
