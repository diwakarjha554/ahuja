/**
 * The root loading state, shown before the layouts below the root have
 * streamed in. It stands on the dark storefront stage (data-storefront) so a
 * first load never flashes light: a marigold spinner, centred.
 */
export default function Loading() {
  return (
    <div
      data-storefront
      className="bg-background text-foreground flex min-h-dvh items-center justify-center"
    >
      <div
        className="border-border-strong border-t-brand-accent h-9 w-9 animate-spin rounded-full border-[3px]"
        role="status"
        aria-label="Loading"
      />
    </div>
  )
}
