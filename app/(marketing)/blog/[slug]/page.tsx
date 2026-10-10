import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, Phone } from "lucide-react"

import { PostBody } from "@/components/marketing/post-body"
import { Container } from "@/components/shared/container"
import { BTN, BTN_ACCENT, BTN_BLOCK } from "@/components/shared/button-styles"
import { absoluteUrl, siteConfig } from "@/lib/config/site"
import { cn } from "@/lib/utils"
import { db } from "@/server/db"

// Reads a published post from the database, so render per request.
export const dynamic = "force-dynamic"

const coverSrc = (key: string | null) => (key ? `/${key.replace(/^\/+/, "")}` : null)

const fmtDate = (d: Date | null) =>
  d ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(d) : ""

async function getPost(slug: string) {
  return db.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      body: true,
      coverKey: true,
      authorName: true,
      publishedAt: true,
      updatedAt: true,
      seoTitle: true,
      seoDesc: true,
    },
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: "Guide not found", robots: { index: false } }

  const title = post.seoTitle || post.title
  const description = post.seoDesc || post.excerpt || undefined
  const cover = coverSrc(post.coverKey)
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: absoluteUrl(`/blog/${post.slug}`),
      ...(cover ? { images: [cover] } : {}),
      ...(post.publishedAt ? { publishedTime: post.publishedAt.toISOString() } : {}),
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const cover = coverSrc(post.coverKey)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    ...(post.excerpt ? { description: post.excerpt } : {}),
    ...(cover ? { image: absoluteUrl(cover) } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt.toISOString() } : {}),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Person", name: post.authorName },
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(`/blog/${post.slug}`) },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="border-b border-border bg-background">
        <Container className="pt-8 pb-10 md:pt-12 md:pb-14">
          <Link
            href="/blog"
            className="group inline-flex h-11 items-center gap-2 text-[15px] font-semibold text-ink-secondary transition-colors hover:text-brand-accent"
          >
            <ArrowLeft
              className="h-4 w-4 transition-transform duration-[200ms] ease-standard group-hover:-translate-x-1"
              strokeWidth={2}
              aria-hidden
            />
            All guides
          </Link>
          <h1 className="type-poster mt-4 max-w-[18ch] animate-fade-up text-[clamp(44px,6.4vw,104px)] text-ink">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-6 max-w-[62ch] animate-fade-up text-[17px] leading-relaxed text-ink-secondary [animation-delay:100ms] md:text-lg">
              {post.excerpt}
            </p>
          )}
          <p className="mt-6 animate-fade-up font-mono text-[13px] text-ink-muted [animation-delay:160ms]">
            {post.authorName}
            {post.publishedAt ? `, ${fmtDate(post.publishedAt)}` : ""}
          </p>
        </Container>
      </section>

      <section className="bg-background py-10 md:py-14">
        <Container>
          {cover && (
            <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-sm bg-surface-sunken md:mb-14 lg:aspect-[21/9]">
              <Image src={cover} alt={post.title} fill sizes="(min-width:1600px) 1520px, 100vw" className="object-cover" priority />
            </div>
          )}
          <article className="mx-auto max-w-[68ch]">
            <PostBody value={post.body} />
          </article>
        </Container>
      </section>

      {/* After the guide: the next step, as on the home page's closing block. */}
      <section className="border-t border-border bg-card py-12 md:py-16">
        <Container className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="type-poster text-[clamp(44px,5.6vw,88px)] text-ink">
            <span className="block">Room size in,</span>
            <span className="block text-brand-accent">parts list out</span>
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/bulk-quote" className={cn(BTN, BTN_ACCENT, BTN_BLOCK, "px-6 font-semibold hover:-translate-y-0.5")}>
              Get a bulk quote
              <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
            </Link>
            <a
              href={`tel:${siteConfig.phones[0].tel}`}
              className={cn(
                BTN,
                BTN_BLOCK,
                "border border-border-strong px-6 font-mono font-semibold text-ink hover:-translate-y-0.5 hover:border-ink",
              )}
            >
              <Phone className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
              {siteConfig.phones[0].display}
            </a>
          </div>
        </Container>
      </section>
    </>
  )
}
