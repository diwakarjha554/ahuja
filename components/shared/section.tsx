import { Container } from "@/components/shared/container"
import { Reveal } from "@/components/shared/reveal"
import { cn } from "@/lib/utils"

/**
 * A storefront section. Heading stands alone: NO eyebrow label above it.
 * `poster` sets the title in the condensed poster caps the home page uses.
 */
export function Section({
  title,
  description,
  action,
  children,
  className,
  poster = false,
}: {
  title?: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  poster?: boolean
}) {
  return (
    <section className={cn(poster ? "py-14 md:py-20" : "py-12 md:py-16", className)}>
      <Container>
        {(title || action) && (
          <Reveal className={cn("flex flex-wrap items-end justify-between gap-x-6 gap-y-3", poster ? "mb-8 md:mb-10" : "mb-6 md:mb-8")}>
            <div>
              {title && (
                <h2
                  className={cn(
                    "text-ink",
                    poster
                      ? "type-poster text-[clamp(48px,7vw,112px)]"
                      : "font-display text-2xl font-bold tracking-[-0.01em] md:text-[32px]",
                  )}
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className={cn("max-w-2xl text-ink-muted", poster ? "mt-4 text-[17px] leading-relaxed" : "mt-2")}>
                  {description}
                </p>
              )}
            </div>
            {action}
          </Reveal>
        )}
        {children}
      </Container>
    </section>
  )
}
