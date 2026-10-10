import { Suspense } from "react"
import type { Metadata } from "next"
import { ChangePasswordForm } from "@/features/auth/components/change-password-form"

export const metadata: Metadata = { title: "Change password", robots: { index: false } }

export default function ChangePasswordPage() {
  return (
    <Suspense>
      <ChangePasswordForm />
    </Suspense>
  )
}
