/**
 * A page title with an optional line under it and actions on the right.
 *
 * Two looks from one set of props. In the staff console it is a compact
 * heading. Inside the dark storefront ([data-storefront] on the marketing
 * layout) the title is set in the home page's poster caps, large, and rises
 * in on load; the `[[data-storefront]_&]:` variants switch it, so the console
 * keeps its own scale.
 */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="border-border mb-6 flex flex-wrap items-start justify-between gap-3 border-b pb-5 [[data-storefront]_&]:mb-8 [[data-storefront]_&]:items-end [[data-storefront]_&]:gap-x-8 [[data-storefront]_&]:gap-y-4 [[data-storefront]_&]:pb-8 [[data-storefront]_&]:md:mb-10">
      <div className="min-w-0">
        <h1 className="font-display text-ink [[data-storefront]_&]:animate-fade-up [[data-storefront]_&]:type-poster text-2xl [overflow-wrap:anywhere] [[data-storefront]_&]:text-[clamp(48px,8vw,128px)]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-ink-muted [[data-storefront]_&]:animate-fade-up mt-1 text-sm [[data-storefront]_&]:mt-4 [[data-storefront]_&]:max-w-2xl [[data-storefront]_&]:text-[17px] [[data-storefront]_&]:leading-relaxed [[data-storefront]_&]:[animation-delay:90ms]">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="[[data-storefront]_&]:animate-fade-up flex flex-wrap gap-2 [[data-storefront]_&]:[animation-delay:160ms]">
          {actions}
        </div>
      )}
    </div>
  )
}
