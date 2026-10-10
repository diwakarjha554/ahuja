import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, BookOpen, Phone } from "lucide-react"

import { Container } from "@/components/shared/container"
import { Reveal } from "@/components/shared/reveal"
import { InViewVideo } from "@/components/shared/in-view-video"
import { CATEGORY_MEDIA } from "@/components/marketing/category-media"
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

/** The arrow chip every linked tile carries; it turns a quarter on hover. */
function ArrowChip({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-sm transition-[background-color,color,rotate] duration-[240ms] ease-standard group-hover:rotate-45",
        className,
      )}
    >
      <ArrowUpRight className="h-5 w-5 -rotate-45" strokeWidth={2} />
    </span>
  )
}

export default async function BlogPage() {
  const posts = await db.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: { slug: true, title: true, excerpt: true, coverKey: true, authorName: true, publishedAt: true },
  })

  return (
    <>
      <section className="border-b border-border bg-background">
        <Container className="grid gap-8 pt-10 pb-12 md:pt-16 md:pb-16 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-14">
          <h1 className="type-poster animate-fade-up text-[clamp(48px,8vw,128px)] text-ink">
            Guides<span className="text-brand-accent">.</span>
          </h1>
          <p className="animate-fade-up text-[17px] leading-relaxed text-ink-secondary [animation-delay:120ms] md:text-lg lg:pb-3">
            Practical guides to choosing and setting up Ahuja public-address systems: amplifier wattage, 100 V line
            speaker runs, microphones and complete sets for schools, offices and worship.
          </p>
        </Container>
      </section>

      <section className="bg-background py-12 md:py-16">
        <Container>{posts.length === 0 ? <NoGuidesYet /> : <PostGrid posts={posts} />}</Container>
      </section>
    </>
  )
}

type PostSummary = {
  slug: string
  title: string
  excerpt: string | null
  coverKey: string | null
  authorName: string
  publishedAt: Date | null
}

/** Published guides: the newest one wide, the rest in a grid; each lifts on hover. */
function PostGrid({ posts }: { posts: PostSummary[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
      {posts.map((p, i) => {
        const cover = coverSrc(p.coverKey)
        const lead = i === 0 && posts.length > 2
        return (
          <Reveal key={p.slug} delay={Math.min(i, 5) * 70} className={cn("h-full", lead && "sm:col-span-2")}>
            <Link
              href={`/blog/${p.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-sm border border-border bg-card transition-[translate,border-color,box-shadow] duration-[220ms] ease-standard hover:-translate-y-1.5 hover:border-brand-accent/60 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <div className={cn("relative overflow-hidden bg-surface-sunken", lead ? "aspect-[16/9] lg:aspect-[21/9]" : "aspect-[16/9]")}>
                {cover ? (
                  <Image
                    src={cover}
                    alt=""
                    fill
                    sizes={lead ? "(min-width:1024px) 66vw, 100vw" : "(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"}
                    className="object-cover transition-transform duration-[900ms] ease-standard group-hover:scale-[1.05]"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center">
                    <BookOpen className="h-8 w-8 text-ink-muted" strokeWidth={1.75} aria-hidden />
                  </span>
                )}
                <ArrowChip className="absolute top-3 right-3 bg-ink text-background group-hover:bg-brand-accent group-hover:text-brand-accent-ink" />
              </div>
              <div className="flex flex-1 flex-col p-5 md:p-6">
                <h2
                  className={cn(
                    "font-display font-bold tracking-[-0.01em] text-ink transition-colors group-hover:text-brand-accent",
                    lead ? "text-[clamp(24px,2.4vw,34px)] leading-tight" : "text-xl leading-snug",
                  )}
                >
                  {p.title}
                </h2>
                {p.excerpt && <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-ink-muted">{p.excerpt}</p>}
                <p className="mt-auto pt-5 font-mono text-[12px] text-ink-muted">
                  {p.authorName}
                  {p.publishedAt ? `, ${fmtDate(p.publishedAt)}` : ""}
                </p>
              </div>
            </Link>
          </Reveal>
        )
      })}
    </div>
  )
}

/**
 * Nothing published yet. Says so plainly, then hands over the three ways to
 * get the same advice today: a call, WhatsApp, or a bulk quote.
 */
function NoGuidesYet() {
  const phone = siteConfig.phones[0]
  const media = CATEGORY_MEDIA.mixers?.media
  const waHref = `https://wa.me/${siteConfig.whatsapp.number}?text=${encodeURIComponent(
    "Hi, I need help choosing an Ahuja PA system.",
  )}`

  return (
    <div className="grid gap-3 md:gap-4 lg:grid-cols-[1.25fr_1fr]">
      <Reveal className="relative isolate flex min-h-[420px] flex-col justify-end overflow-hidden rounded-sm bg-night p-6 text-white md:min-h-[520px] md:p-10 lg:row-span-3">
        {media && "video" in media ? (
          <InViewVideo src={media.video} poster={media.poster} className="absolute inset-0 -z-10 h-full w-full" />
        ) : null}
        <span aria-hidden className="absolute inset-0 -z-10 bg-night/45" />
        <span aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-3/4 bg-linear-to-t from-night via-night/75 to-night/0" />
        <h2 className="type-poster text-[clamp(52px,7vw,112px)]">
          <span className="block">No guides</span>
          <span className="block text-brand-accent">published yet</span>
        </h2>
        <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/80">
          We are writing them now: amplifier wattage for a room, 100 V line speaker runs, wired against wireless
          microphones. Until they are up, ask us directly and we size the system with you, with model numbers and
          a GST quote.
        </p>
      </Reveal>

      <Reveal delay={80}>
        <a
          href={`tel:${phone.tel}`}
          className="group flex h-full items-center justify-between gap-4 rounded-sm bg-brand-accent p-6 text-brand-accent-ink transition-[translate,rotate,box-shadow] duration-[240ms] ease-standard hover:-translate-y-1 hover:-rotate-1 hover:shadow-md md:p-8"
        >
          <span>
            <span className="flex items-center gap-2 text-[15px] font-semibold">
              <Phone className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
              Call the Delhi line
            </span>
            <span className="mt-2 block font-mono text-[clamp(30px,3.4vw,46px)] leading-none font-semibold tracking-[-0.02em] tabular-nums">
              {phone.display}
            </span>
          </span>
          <ArrowChip className="bg-brand-accent-ink text-brand-accent" />
        </a>
      </Reveal>

      <Reveal delay={160}>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex h-full items-center justify-between gap-4 rounded-sm bg-brand-deep p-6 text-white transition-[translate,rotate,box-shadow] duration-[240ms] ease-standard hover:-translate-y-1 hover:-rotate-1 hover:shadow-md md:p-8"
        >
          <span>
            <span className="block text-[15px] font-semibold">Send the room size on WhatsApp</span>
            <span className="mt-2 block font-mono text-[clamp(26px,2.8vw,38px)] leading-none font-semibold tracking-[-0.02em] tabular-nums">
              {siteConfig.whatsapp.display}
            </span>
          </span>
          <ArrowChip className="bg-white text-night group-hover:bg-brand-accent group-hover:text-brand-accent-ink" />
        </a>
      </Reveal>

      <Reveal delay={240}>
        <Link
          href="/bulk-quote"
          className="group flex h-full items-center justify-between gap-4 rounded-sm bg-ink p-6 text-background transition-[translate,rotate,box-shadow] duration-[240ms] ease-standard hover:-translate-y-1 hover:-rotate-1 hover:shadow-md md:p-8"
        >
          <span>
            <span className="type-poster block text-[clamp(34px,3.2vw,48px)]">Get a bulk quote</span>
            <span className="mt-2 block text-[15px] opacity-75">List the models and quantities, we price the order.</span>
          </span>
          <ArrowChip className="bg-background text-ink group-hover:bg-brand-accent group-hover:text-brand-accent-ink" />
        </Link>
      </Reveal>
    </div>
  )
}
