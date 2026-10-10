"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field"

export function ChangePasswordForm() {
  const router = useRouter()
  const next = useSearchParams().get("next") || "/admin"
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value })

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        try {
          const res = await fetch("/api/me/password", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(form),
          })
          const data = await res.json()
          if (data.success) {
            toast.success("Password changed.")
            router.push(next)
            router.refresh()
          } else {
            toast.error(data.error?.message ?? "Could not change the password.")
          }
        } finally {
          setBusy(false)
        }
      }}
    >
      <h1 className="font-display text-xl text-ink">Set a new password</h1>
      <p className="text-sm text-ink-muted">Your account is on a temporary password. Choose a new one to continue.</p>
      <Field label="Current password" htmlFor="cur" hint="Leave blank if you were given a temporary password.">
        <Input id="cur" type="password" autoComplete="current-password" value={form.currentPassword} onChange={set("currentPassword")} />
      </Field>
      <Field label="New password" htmlFor="new">
        <Input id="new" type="password" autoComplete="new-password" required value={form.newPassword} onChange={set("newPassword")} />
      </Field>
      <Field label="Confirm new password" htmlFor="conf">
        <Input id="conf" type="password" autoComplete="new-password" required value={form.confirmPassword} onChange={set("confirmPassword")} />
      </Field>
      <Button type="submit" disabled={busy} className="w-full">
        {busy ? "Saving..." : "Change password"}
      </Button>
    </form>
  )
}
