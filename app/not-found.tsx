import Link from "next/link"
import { BTN, BTN_PRIMARY } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-mono text-sm text-ink-muted">404</p>
      <h1 className="font-display text-3xl text-ink">Page not found</h1>
      <p className="max-w-md text-sm text-ink-muted">
        The page you are looking for has moved or no longer exists.
      </p>
      <Link href="/" className={cn(BTN, BTN_PRIMARY)}>
        Back to home
      </Link>
    </div>
  )
}
