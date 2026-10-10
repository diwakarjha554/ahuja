import { Suspense } from "react"
import type { Metadata } from "next"

import { LoginForm } from "@/features/auth/components/login-form"
import { hasDatabase } from "@/lib/env"

export const metadata: Metadata = { title: "Sign in", robots: { index: false } }

// Read per request: whether a database is configured is a deployment setting.
export const dynamic = "force-dynamic"

export default function LoginPage() {
  // Staff accounts live in the database; without one there is nothing to sign in to.
  if (!hasDatabase()) {
    return (
      <div className="space-y-2 text-sm">
        <h1 className="font-display text-lg font-semibold text-ink">Console not connected</h1>
        <p className="text-ink-secondary">
          This deployment runs the shop from its catalogue file, without a database, so there are no staff
          accounts to sign in to. Connect a database (DATABASE_URL), run the setup, and the console opens here.
        </p>
      </div>
    )
  }
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
