"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field"

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get("next") || "/admin"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        try {
          const res = await signIn("credentials", { email, password, redirect: false })
          if (res?.error) {
            toast.error("Those details are not correct.")
            return
          }
          router.push(next)
          router.refresh()
        } finally {
          setBusy(false)
        }
      }}
    >
      <h1 className="font-display text-xl text-ink">Sign in</h1>
      <Field label="Email" htmlFor="email">
        <Input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="Password" htmlFor="password">
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
      <Button type="submit" disabled={busy} className="w-full">
        {busy ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  )
}
