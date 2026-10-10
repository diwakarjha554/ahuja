import { Newspaper } from "lucide-react"

import { listPosts, type PostStatus } from "@/features/blog/server/blog-admin.service"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table"

type BadgeTone = React.ComponentProps<typeof Badge>["tone"]

const STATUS_META: Record<PostStatus, { tone: BadgeTone; label: string }> = {
  DRAFT: { tone: "neutral", label: "Draft" },
  SCHEDULED: { tone: "info", label: "Scheduled" },
  PUBLISHED: { tone: "success", label: "Published" },
}

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
})

function fmtDate(value: string | null) {
  if (!value) return "-"
  return dateFmt.format(new Date(value))
}

export default async function AdminBlogPage() {
  const result = await listPosts()
  const posts = result.ok ? result.data : []

  return (
    <div>
      <PageHeader
        title="Blog"
        subtitle="Posts are stored in the database. This list is read only for now: there is no in-console editor yet."
      />

      {posts.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="No blog posts yet"
          description="Posts are managed directly in the database for now. Once a post is added, it will appear here with its status."
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Title</TH>
              <TH>Author</TH>
              <TH>Status</TH>
              <TH>Published</TH>
              <TH>Updated</TH>
            </TR>
          </THead>
          <TBody>
            {posts.map((post) => {
              const meta = STATUS_META[post.status]
              return (
                <TR key={post.id} className="hover:bg-accent">
                  <TD>
                    <div className="font-medium text-ink">{post.title}</div>
                    <div className="font-mono text-xs text-ink-muted">/{post.slug}</div>
                  </TD>
                  <TD className="text-ink-secondary">{post.authorName}</TD>
                  <TD>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </TD>
                  <TD className="whitespace-nowrap tabular-nums text-ink-muted">
                    {fmtDate(post.publishedAt)}
                  </TD>
                  <TD className="whitespace-nowrap tabular-nums text-ink-muted">
                    {fmtDate(post.updatedAt)}
                  </TD>
                </TR>
              )
            })}
          </TBody>
        </Table>
      )}
    </div>
  )
}
