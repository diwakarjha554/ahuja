import { Container } from "@/components/shared/container"
import { Reveal } from "@/components/shared/reveal"
import { cn } from "@/lib/utils"

/** A storefront section. Heading stands alone: NO eyebrow label above it. */
export function Section({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("py-12 md:py-16", className)}>
      <Container>
        {(title || action) && (
          <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-3 md:mb-8">
            <div>
              {title && (
                <h2 className="font-display text-2xl font-bold tracking-[-0.01em] text-ink md:text-[32px]">{title}</h2>
              )}
              {description && <p className="mt-2 max-w-2xl text-ink-muted">{description}</p>}
            </div>
            {action}
          </Reveal>
        )}
        {children}
      </Container>
    </section>
  )
}
