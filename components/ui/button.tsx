import { cn } from "@/lib/utils"
import { BTN, BTN_PRIMARY, BTN_SECONDARY, BTN_GHOST, BTN_DANGER, BTN_ACCENT } from "@/components/shared/button-styles"

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent"
const VARIANT: Record<Variant, string> = {
  primary: BTN_PRIMARY,
  secondary: BTN_SECONDARY,
  ghost: BTN_GHOST,
  danger: BTN_DANGER,
  accent: BTN_ACCENT,
}

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={cn(BTN, VARIANT[variant], className)} {...props} />
}
