import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { PostBody } from "@/components/marketing/post-body"
import { Container } from "@/components/shared/container"
import { absoluteUrl, siteConfig } from "@/lib/config/site"
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
    <Container className="py-10 md:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="max-w-[720px]">
        <Link href="/blog" className="text-sm text-brand hover:underline">
          Back to guides
        </Link>
        <h1 className="mt-3 font-display text-3xl text-ink md:text-4xl">{post.title}</h1>
        <p className="mt-3 text-sm text-ink-muted">
          {post.authorName}
          {post.publishedAt ? `, ${fmtDate(post.publishedAt)}` : ""}
        </p>
        {cover && (
          <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-sm border border-border bg-card">
            <Image src={cover} alt={post.title} fill sizes="(min-width:768px) 720px, 100vw" className="object-cover" priority />
          </div>
        )}
        <div className="mt-8">
          <PostBody value={post.body} />
        </div>
      </article>
    </Container>
  )
}
