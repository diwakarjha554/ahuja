import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { BookOpen } from "lucide-react"

import { Container } from "@/components/shared/container"
import { EmptyState } from "@/components/shared/empty-state"
import { Card } from "@/components/ui/card"
import { BTN, BTN_SECONDARY } from "@/components/shared/button-styles"
import { siteConfig } from "@/lib/config/site"
import { cn } from "@/lib/utils"
import { db } from "@/server/db"

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Buying and setup guides for Ahuja public-address equipment: amplifier wattage, 100 V line speakers, microphones and complete systems.",
  alternates: { canonical: "/blog" },
}

// Reads published posts from the database, so render per request.
export const dynamic = "force-dynamic"

const coverSrc = (key: string | null) => (key ? `/${key.replace(/^\/+/, "")}` : null)

const fmtDate = (d: Date | null) =>
  d ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(d) : ""

export default async function BlogPage() {
  const posts = await db.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: { slug: true, title: true, excerpt: true, coverKey: true, authorName: true, publishedAt: true },
  })

  return (
    <Container className="py-10 md:py-14">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl text-ink md:text-4xl">Guides</h1>
        <p className="mt-3 text-ink-secondary">
          Practical guides to choosing and setting up Ahuja public-address systems: amplifier wattage, 100 V line
          speaker runs, microphones and complete sets for schools, offices and worship.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={BookOpen}
            title="Guides are coming soon"
            description={`We are writing buying guides for Ahuja amplifiers, speakers and microphones. Meanwhile, call ${siteConfig.phones[0].display} or request a bulk quote and we will help you choose.`}
            action={
              <Link href="/bulk-quote" className={cn(BTN, BTN_SECONDARY)}>
                Request a bulk quote
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => {
            const cover = coverSrc(p.coverKey)
            return (
              <Card key={p.slug} className="overflow-hidden transition-shadow hover:shadow-sm">
                <Link href={`/blog/${p.slug}`} className="block">
                  <div className="relative aspect-[16/9] bg-card">
                    {cover ? (
                      <Image
                        src={cover}
                        alt={p.title}
                        fill
                        sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-surface-sunken">
                        <BookOpen className="h-6 w-6 text-ink-muted" strokeWidth={1.75} />
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h2 className="font-display text-lg text-ink">{p.title}</h2>
                    {p.excerpt && <p className="mt-2 line-clamp-3 text-sm text-ink-muted">{p.excerpt}</p>}
                    <p className="mt-3 text-xs text-ink-muted">
                      {p.authorName}
                      {p.publishedAt ? `, ${fmtDate(p.publishedAt)}` : ""}
                    </p>
                  </div>
                </Link>
              </Card>
            )
          })}
        </div>
      )}
    </Container>
  )
}
