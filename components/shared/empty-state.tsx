import { cn } from "@/lib/utils"

/**
 * An empty list or a "nothing matched" panel. In the staff console it stays
 * quiet. Inside the dark storefront ([data-storefront]) the icon sits on a
 * marigold block that tilts on hover and the title is set in poster caps, like
 * the home page's facts strip; the `[[data-storefront]_&]:` variants switch it.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "group border-border bg-card flex flex-col items-center justify-center gap-3 rounded-sm border border-dashed px-6 py-14 text-center",
        "[[data-storefront]_&]:border-border-strong [[data-storefront]_&]:gap-4 [[data-storefront]_&]:py-16 [[data-storefront]_&]:md:py-20",
        className,
      )}
    >
      {Icon && (
        <span className="bg-surface-sunken ease-standard [[data-storefront]_&]:bg-brand-accent flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-[240ms] [[data-storefront]_&]:h-14 [[data-storefront]_&]:w-14 [[data-storefront]_&]:rounded-sm [[data-storefront]_&]:group-hover:-rotate-6">
          <Icon className="text-ink-muted [[data-storefront]_&]:text-brand-accent-ink h-5 w-5 [[data-storefront]_&]:h-6 [[data-storefront]_&]:w-6" />
        </span>
      )}
      <h3 className="font-display text-ink [[data-storefront]_&]:type-poster text-lg [[data-storefront]_&]:max-w-xl [[data-storefront]_&]:text-[clamp(34px,4vw,52px)] [[data-storefront]_&]:text-balance">
        {title}
      </h3>
      {description && (
        <p className="text-ink-muted max-w-sm text-sm [[data-storefront]_&]:max-w-md [[data-storefront]_&]:text-[15px] [[data-storefront]_&]:leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="[[data-storefront]_&]:mt-2">{action}</div>}
    </div>
  )
}
