// The ONE button box: 44px tall, 6px radius, 16px horizontal padding. Compose
// with cn(): cn(BTN, BTN_PRIMARY). Never retype a height.
export const BTN =
  "inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-sm px-4 text-[15px] font-medium leading-none transition-[background-color,color,border-color,box-shadow,transform,translate,scale] duration-[140ms] ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer"

export const BTN_PRIMARY = "bg-brand text-brand-ink hover:bg-brand-hover hover:shadow-sm"
export const BTN_SECONDARY = "border border-border-strong bg-card text-ink hover:bg-secondary"
export const BTN_GHOST = "text-ink hover:bg-accent"
export const BTN_DANGER = "bg-danger text-white hover:opacity-90"
export const BTN_ACCENT = "bg-brand-accent text-brand-accent-ink hover:opacity-90"

// Square icon button, same 44px box.
export const BTN_ICON = "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm"
// Full width on phones, natural from sm up. Height never changes.
export const BTN_BLOCK = "w-full sm:w-auto"
