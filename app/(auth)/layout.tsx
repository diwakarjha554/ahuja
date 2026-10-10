import { Logo } from "@/components/shared/logo"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-sm rounded-sm border border-border bg-card p-6 shadow-sm">{children}</div>
      <p className="mt-6 text-xs text-ink-muted">Staff access only.</p>
    </div>
  )
}
